import { Flavor, FlavorTypeMap, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';

import {
  SvgToRasterOptions,
  svgToRaster
} from './../src/plugins/svg-to-raster';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

const file = fs.readFileSync(
  path.resolve(`${FIXTURES}/nav-icons/home/filled.svg`).toString()
);

const flavor: Flavor = new Flavor(`${FIXTURES}/nav-icons/home/filled.svg`, {
  name: 'filled',
  contents: file,
  path: `${FIXTURES}/nav-icons/home/filled.svg`
});

const icon = new Icon({
  iconPath: `${FIXTURES}/nav-icons/home`,
  variants: [
    {
      path: `${FIXTURES}/nav-icons/home/filled.svg`,
      name: 'filled'
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

describe('svgToRaster()', function() {
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
        path: './filled-24x12@2.png'
      },
      webp: {
        name: 'filled-24x12@2',
        path: './filled-24x12@2.webp'
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
        path: './filled-60x60@2.png'
      },
      webp: {
        name: 'filled-60x60@2',
        path: './filled-60x60@2.webp'
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
        name: 'filled-60x60',
        path: './filled-60x60.png'
      },
      webp: {
        name: 'filled-60x60',
        path: './filled-60x60.webp'
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
        name: 'filledwithResolutionInBetween-60x60@@1.5',
        path: './filledwithResolutionInBetween-60x60@@1.5.png'
      },
      webp: {
        name: 'filledwithResolutionInBetween-60x60@@1.5',
        path: './filledwithResolutionInBetween-60x60@@1.5.webp'
      }
    };

    output = await svgToRaster.fn(flavor2, icon, options);
    assert.deepEqual(
      flavorWithTypes2,
      output.getConfig().types,
      'works when the resolution is present in the name'
    );
  });
});
