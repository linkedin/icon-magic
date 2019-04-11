import { Flavor, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';

import { svgGenerate } from '../src/plugins/svg-generate';

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
  iconPath: `${FIXTURES}/out/home`,
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
  sourceConfigFile: `${FIXTURES}/nav-icons/iconrc.json`
});

const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" id="home-filled" data-supported-dps="8x8 16x16" fill="currentColor"><path d="M28 13.36L16.64 6.19a1.2 1.2 0 0 0-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 0 0 1 1h6v-5h4v5h6a1 1 0 0 0 1-1V13.67L27 15z"/></svg>`;

describe('svgGenerate()', function() {
  it('Optimizes the svg file', async () => {
    const outputFlavor: Flavor = (await svgGenerate.fn(
      flavor,
      icon,
      {}
    )) as Flavor;
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });
});
