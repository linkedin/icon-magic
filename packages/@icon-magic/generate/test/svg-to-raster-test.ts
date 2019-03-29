import * as path from 'path';
import * as assert from 'assert';
import { svgToRaster } from './../src/plugins/svg-to-raster';
import { Icon, Flavor, FlavorTypeMap } from '@icon-magic/icon-models';
import * as fs from 'fs-extra';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

let options = {
  propCombo: {
    sizes: { width: 24, height: 12 },
    resolutions: 2
  }
};

let file = fs.readFileSync(
  path.resolve(`${FIXTURES}/nav-icons/home/filled.svg`).toString()
);

let flavor: Flavor = new Flavor(`${FIXTURES}/nav-icons/home/filled.svg`, {
  name: 'filled',
  contents: file,
  path: `${FIXTURES}/nav-icons/home/filled.svg`
});

let icon = new Icon({
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
  outputPath: './out',
  iconName: 'home',
  sourceConfigFile: `${FIXTURES}/nav-icons/iconrc.json`
});

let flavorWithTypes: FlavorTypeMap = {
  png: { name: 'filled-48x24', path: './filled-48x24.png' },
  webp: { name: 'filled-48x24', path: './filled-48x24.webp' }
};

describe('svgToRaster()', function() {
  it('Creates all the raster assets and updates the icon correctly', async () => {
    let flavors = await svgToRaster.fn(flavor, icon, options);
    assert.deepEqual(flavorWithTypes, flavors.config.types);
  });
});
