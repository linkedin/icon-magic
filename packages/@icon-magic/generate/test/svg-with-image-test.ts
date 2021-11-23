import { Flavor, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';

import { svgWithImage } from '../src/plugins/svg-with-image';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

const lightFile = fs.readFileSync(
  path.resolve(`${FIXTURES}/entity-ghosts/group/accent-1.svg`).toString(), 'utf-8'
);

const lightFlavor: Flavor = new Flavor(`${FIXTURES}/entity-ghosts/group/accent-1.svg`, {
  name: 'accent-1',
  contents: lightFile,
  path: `${FIXTURES}/entity-ghosts/group/accent-1.svg`,
  imageset: 'accent-1',
  colorScheme: 'light'
});

const icon = new Icon({
  iconPath: `${FIXTURES}/out/group`,
  variants: [
    {
      path: `${FIXTURES}/entity-ghosts/group/accent-1.svg`,
      name: 'accent-1',
      imageset: 'accent-1',
      colorScheme: 'light'
    }
  ],
  sizes: [128],
  resolutions: [1, 2],
  outputPath: `/${FIXTURES}/out`,
  iconName: 'group',
  sourceConfigFile: `${FIXTURES}/entity-ghosts/group/iconrc.json`,
  flavors: [
    {
      "name": "accent-1",
      "path": "./build/accent-1.svg",
      "imageset": 'accent-1',
      "colorScheme": 'light',
      "types": {}
    }
  ]
});

describe('svgWithImage()', function () {
  it('creates an svg with an image tag referencing the pathToTheImageAsset', async () => {

    const pathToTheImageAsset = 'mockOutputPathForSvgImageAsset';

    const outputSvgStripped: string = `
    <svg id="group-accent-1" xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <image href="${pathToTheImageAsset}/group/accent-1.svg" alt=""/>
    </svg>
    `.replace(/\s+/g, '');

    const outputFlavor: Flavor = await svgWithImage.fn(lightFlavor, icon, {
      pathToTheImageAsset
    });

    const outputFlavorBuffer = await outputFlavor.getContents();
    const outputFlavorStringStripped = outputFlavorBuffer.toString('utf-8').replace(/\s+/g, '');

    //result has the image tag embedded with a path to the svg
    assert.strictEqual(outputFlavorStringStripped, outputSvgStripped);
  });



  it('throws an error if pathToTheImageAsset is not defined in the config', async () => {
    let error = null;
    try {
      await svgWithImage.fn(lightFlavor, icon, {});
    }
    catch (err) {
      error = err;
    }
    assert.ok(/SVGWithImageError/.test(error));
  });
});
