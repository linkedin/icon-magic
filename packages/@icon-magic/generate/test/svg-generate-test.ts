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
  sourceConfigFile: `${FIXTURES}/nav-icons/iconrc.json`,
  metadata: {
    nameSizeMapping: {
      filled: 8,
      outline: 16
    }
  }
});

const iconFlip = new Icon({
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
  sourceConfigFile: `${FIXTURES}/nav-icons/iconrc.json`,
  metadata: {
    nameSizeMapping: {
      filled: 8,
      outline: 16
    },
    rtlFlip: true
  }
});

describe('svgGenerate()', function () {
  it('adds only current size when addSupportedDps is current', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled" aria-hidden="true" role="none" data-supported-dps="8x8" fill="currentColor">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="currentColor"/>\n</svg>`;

    const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
      addSupportedDps: 'current'
    });
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

  it('does not add data-supported-dps when addSupportedDps is none', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled" aria-hidden="true" role="none" fill="currentColor">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="currentColor"/>\n</svg>`;

    const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
      addSupportedDps: 'none'
    });
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

  it('does not add data-supported-dps when addSupportedDps is all', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled" aria-hidden="true" role="none" data-supported-dps="8x8 16x16" fill="currentColor">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="currentColor"/>\n</svg>`;

    const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
      addSupportedDps: 'all'
    });
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

  it('Removes fill attributes when isColored is set to true', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled" aria-hidden="true" role="none" data-supported-dps="8x8 16x16">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="#737373"/>\n</svg>`;

    const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
      isColored: true
    });
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

  it('Removes fill attributes when colorByNameMatching is set to filled', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled" aria-hidden="true" role="none" data-supported-dps="8x8 16x16">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="#737373"/>\n</svg>`;

    const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
      colorByNameMatching: ['filled']
    });
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

  it('Does not remove width and height if isFixedDimensions is true', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" id="home-filled" aria-hidden="true" role="none" data-supported-dps="8x8 16x16" fill="currentColor">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="currentColor"/>\n</svg>`;

    const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
      isFixedDimensions: true
    });
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

  it('adds class "rtl-flip" if rtlFlip is true', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="rtl-flip" id="home-filled" aria-hidden="true" role="none" data-supported-dps="8x8 16x16" fill="currentColor">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="currentColor"/>\n</svg>`;

    const outputFlavor: Flavor = await svgGenerate.fn(flavor, iconFlip, {});
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

  it('adds classes if provided', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="flip" id="home-filled" aria-hidden="true" role="none" data-supported-dps="8x8 16x16" fill="currentColor">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="currentColor"/>\n</svg>`;

    const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
      classNames: ['flip']
    });
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

});
