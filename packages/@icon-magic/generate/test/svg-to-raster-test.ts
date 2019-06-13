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
});
