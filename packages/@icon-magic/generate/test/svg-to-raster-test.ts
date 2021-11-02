import { Flavor, FlavorTypeMap, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';

import {
  SvgToRasterOptions,
  svgToRaster
} from './../src/plugins/svg-to-raster';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
const output = path.resolve(FIXTURES, 'out');

const file = fs.readFileSync(
  path.resolve(`${FIXTURES}/nav-icons/home/filled.svg`).toString()
);

const flipFile = fs.readFileSync(
  path.resolve(`${FIXTURES}/system-icons/arrow-left/medium.svg`).toString()
);

const flavor: Flavor = new Flavor(`${FIXTURES}/nav-icons/home/filled.svg`, {
  name: 'filled',
  imageset: 'filled',
  contents: file,
  path: `${FIXTURES}/nav-icons/home/filled.svg`
});

const flipFlavor: Flavor = new Flavor(`${FIXTURES}/system-icons/arrow-left/medium.svg`, {
  name: 'medium',
  imageset: 'default',
  contents: flipFile,
  path: `${FIXTURES}/system-icons/arrow-left/medium.svg.svg`
});

const icon = new Icon({
  iconPath: `${FIXTURES}/nav-icons/home`,
  variants: [
    {
      path: `${FIXTURES}/nav-icons/home/filled.svg`,
      name: 'filled',
      imageset: 'filled'
    },
    {
      path: `${FIXTURES}/nav-icons/home/outline.svg`,
      name: 'someOtherName'
    }
  ],
  sizes: [8, 16],
  resolutions: [1, 2, 3],
  outputPath: `/${FIXTURES}/out`,
  iconName: 'home',
  sourceConfigFile: `${FIXTURES}/nav-icons/iconrc.json`,
  metadata: {
    nameSizeMapping: {
      filled: 60,
      outline: 40
    }
  }
});

const flipIcon = new Icon({
  iconPath: `${FIXTURES}/system-icons/arrow-left`,
  variants: [
    {
      path: `${FIXTURES}/system-icons/arrow-left/medium.svg`,
      name: 'medium',
      imageset: 'default'
    },
    {
      path: `${FIXTURES}/nav-icons/home/outline.svg`,
      name: 'someOtherName'
    }
  ],
  sizes: [16],
  resolutions: [1, 2],
  outputPath: `/${FIXTURES}/out`,
  iconName: 'arrow-left',
  sourceConfigFile: `${FIXTURES}/system-icons/iconrc.json`,
  metadata: {
    rtlFlip: true
  }
});

describe('svgToRaster()', function () {
  it('Creates all the raster assets and updates the icon correctly', async () => {
    console.log('entering svg-generate');

    const options: SvgToRasterOptions = {
      propCombo: {
        sizes: { width: 24, height: 12 },
        resolutions: 2
      }
    };
    const flavorWithTypes: FlavorTypeMap = {
      png: {
        name: 'filled-24x12@2',
        path: './filled-24x12@2.png',
        imageset: 'filled-24x12'
      },
      webp: {
        name: 'filled-24x12@2',
        path: './filled-24x12@2.webp',
        imageset: 'filled-24x12'
      }
    };
    const output: Flavor = await svgToRaster.fn(flavor, icon, options);
    assert.deepEqual(flavorWithTypes, output.getConfig().types);
  });

  it('Uses the size mapping if it is passed in as a parameter', async () => {
    const options: SvgToRasterOptions = {
      useNameSizeMapping: true,
      propCombo: {
        resolutions: 2
      }
    };

    const flavorWithTypes: FlavorTypeMap = {
      png: {
        name: 'filled-60x60@2',
        path: './filled-60x60@2.png',
        imageset: 'filled-60x60'
      },
      webp: {
        name: 'filled-60x60@2',
        path: './filled-60x60@2.webp',
        imageset: 'filled-60x60'
      }
    };
    const output: Flavor = await svgToRaster.fn(flavor, icon, options);
    assert.deepEqual(flavorWithTypes, output.getConfig().types);
  });

  it('Renames the flavor correctly when there are is no resolutions passed in', async () => {
    const options: SvgToRasterOptions = {
      useNameSizeMapping: true,
      propCombo: {}
    };

    const flavorWithTypes: FlavorTypeMap = {
      png: {
        name: 'filled-60x60@1',
        path: './filled-60x60@1.png',
        imageset: 'filled-60x60'
      },
      webp: {
        name: 'filled-60x60@1',
        path: './filled-60x60@1.webp',
        imageset: 'filled-60x60'
      }
    };
    let output: Flavor = await svgToRaster.fn(flavor, icon, options);
    await assert.deepEqual(
      flavorWithTypes,
      output.getConfig().types,
      'works when there is no resolution in the name'
    );

    const flavor2: Flavor = new Flavor(
      `${FIXTURES}/nav-icons/home/filled.svg`,
      {
        name: 'filled@1.5withResolutionInBetween',
        contents: file,
        path: `${FIXTURES}/nav-icons/home/filled.svg`
      }
    );

    const flavorWithTypes2: FlavorTypeMap = {
      png: {
        name: 'filledwithResolutionInBetween-60x60@1.5',
        path: './filledwithResolutionInBetween-60x60@1.5.png'
      },
      webp: {
        name: 'filledwithResolutionInBetween-60x60@1.5',
        path: './filledwithResolutionInBetween-60x60@1.5.webp'
      }
    };

    output = await svgToRaster.fn(flavor2, icon, options);
    assert.deepEqual(
      flavorWithTypes2,
      output.getConfig().types,
      'works when the resolution is present in the name'
    );
  });

  it('Generated raster assets are named correctly when name in flavor is just the resolution', async () => {
    const options: SvgToRasterOptions = {
      propCombo: {
        sizes: { width: 24, height: 12 }
      }
    };

    const flavor2: Flavor = new Flavor(
      `${FIXTURES}/nav-icons/home/filled.svg`,
      {
        name: '@2',
        contents: file,
        path: `${FIXTURES}/nav-icons/home/filled.svg`
      }
    );

    const flavorWithTypes2: FlavorTypeMap = {
      png: {
        name: '24x12@2',
        path: './24x12@2.png'
      },
      webp: {
        name: '24x12@2',
        path: './24x12@2.webp'
      }
    };
    const output: Flavor = await svgToRaster.fn(flavor2, icon, options);
    assert.deepEqual(flavorWithTypes2, output.getConfig().types);
  });

  it('Generated raster assets are named correctly when name in flavor is not specified', async () => {
    const options: SvgToRasterOptions = {
      propCombo: {
        sizes: { width: 24, height: 12 }
      }
    };

    const flavor2: Flavor = new Flavor(
      `${FIXTURES}/nav-icons/home/filled.svg`,
      {
        contents: file,
        path: `${FIXTURES}/nav-icons/home/filled.svg`
      }
    );

    const flavorWithTypes2: FlavorTypeMap = {
      png: {
        name: 'filled-24x12@1',
        path: './filled-24x12@1.png'
      },
      webp: {
        name: 'filled-24x12@1',
        path: './filled-24x12@1.webp'
      }
    };
    const output: Flavor = await svgToRaster.fn(flavor2, icon, options);
    assert.deepEqual(flavorWithTypes2, output.getConfig().types);
  });

  it('Creates the proper rtl webps and pngs', async () => {
    const options: SvgToRasterOptions = {
      propCombo: {
        sizes: { width: 24, height: 12 },
        resolutions: 2
      }
    };

    await svgToRaster.fn(flipFlavor, flipIcon, options);

    const iconPath = `${output}/arrow-left`;

    const flavors = [
      {
        name: 'medium-24x12@2-rtl'
      },
      {
        name: 'medium-24x12@2'
      }
    ];

    const files = fs.readdirSync(iconPath);

    flavors.forEach(flavor => {
      assert.ok(
        files.includes(`${flavor.name}.webp`),
        `includes ${flavor.name}.webp`
      );
    });

    assert.ok(
      files.includes(`medium-24x12@2.png`),
      `correctly includes regular-ltr png`
    );

    flavors.forEach(flavor => {
      assert.ok(
        files.includes(`${flavor.name}.png`),
        `includes ${flavor.name}.png`
      );
    });
  });
});
