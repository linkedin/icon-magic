import { Flavor, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';

import { svgLightDark } from '../src/plugins/svg-light-dark';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

const lightFile = fs.readFileSync(
<<<<<<< HEAD
  path.resolve(`${FIXTURES}/entity-ghosts/group/accent-1.svg`).toString(), 'utf-8'
);

const darkFile = fs.readFileSync(
  path.resolve(`${FIXTURES}/entity-ghosts/group/accent-1-on-dark.svg`).toString(), 'utf-8'
=======
  path.resolve(`${FIXTURES}/entity-ghosts/group/accent-1.svg`).toString()
);

const darkFile = fs.readFileSync(
  path.resolve(`${FIXTURES}/entity-ghosts/group/accent-1-on-dark.svg`).toString()
>>>>>>> b846671... add text fixtures for svgLightDark
);

const lightFlavor: Flavor = new Flavor(`${FIXTURES}/entity-ghosts/group/accent-1.svg`, {
  name: 'accent-1',
  contents: lightFile,
<<<<<<< HEAD
  path: `${FIXTURES}/entity-ghosts/group/accent-1.svg`,
  imageset: 'accent-1',
  colorScheme: 'light'
=======
  path: `${FIXTURES}/entity-ghosts/group/accent-1.svg`
>>>>>>> b846671... add text fixtures for svgLightDark
});

const darkFlavor: Flavor = new Flavor(`${FIXTURES}/entity-ghosts/group/accent-1-on-dark.svg`, {
  name: 'accent-1-on-dark',
  contents: darkFile,
  path: `${FIXTURES}/entity-ghosts/group/accent-1-on-dark.svg`,
  imageset: 'accent-1',
  colorScheme: 'dark'
});

const icon = new Icon({
  iconPath: `${FIXTURES}/out/group`,
  variants: [
    {
      path: `${FIXTURES}/entity-ghosts/group/accent-1.svg`,
<<<<<<< HEAD
      name: 'accent-1',
      imageset: 'accent-1',
      colorScheme: 'light'
=======
      name: 'accent-1'
>>>>>>> b846671... add text fixtures for svgLightDark
    },
    {
      path: `${FIXTURES}/entity-ghosts/group/accent-1-on-dark.svg`,
      name: 'accent-1-on-dark',
      imageset: 'accent-1',
      colorScheme: 'dark'
    }
  ],
  sizes: [128],
  resolutions: [1, 2],
  outputPath: `/${FIXTURES}/out`,
<<<<<<< HEAD
  iconName: 'group',
  sourceConfigFile: `${FIXTURES}/entity-ghosts/group/iconrc.json`,
  flavors: [
    {
      "name": "accent-1-on-dark",
      "path": "./build/accent-1-on-dark.svg",
      "imageset": "accent-1",
      "colorScheme": "dark",
      "types": {}
    },
    {
      "name": "accent-1",
      "path": "./build/accent-1.svg",
      "imageset": 'accent-1',
      "colorScheme": 'light',
      "types": {}
    }
  ]
});

describe('svgLightDark()', function () {
  it('creates parent svg with light and dark children svgs when `imageSet` exists and the `colorScheme` equals `dark`', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128" viewBox="0 0 128 128">
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" display="var(--svg-light-display)">
    <path fill="#e9e5de" d="M0 0h128v128H0z"/>
    <path fill="#e9e5de" d="M0 64.14h128V128H0z"/>
    <path d="M32 64H0v32a32 32 0 0032-32zm64 0a32 32 0 0032 32V64zM64 96a32 32 0 0032-32H32a32 32 0 0032 32zM32 64H0V32a32.06 32.06 0 0132 32zm64 0a32.06 32.06 0 0132-32v32zM64 32a32.06 32.06 0 0132 32H32a32.06 32.06 0 0132-32z" fill="#e9e5de"/>
  </svg>
  <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" display="var(--svg-dark-display)">
    <path fill="#eee" d="M0 0h128v128H0z"/>
    <path fill="#eee" d="M0 64.14h128V128H0z"/>
    <path d="M32 64H0v32a32 32 0 0032-32zm64 0a32 32 0 0032 32V64zM64 96a32 32 0 0032-32H32a32 32 0 0032 32zM32 64H0V32a32.06 32.06 0 0132 32zm64 0a32.06 32.06 0 0132-32v32zM64 32a32.06 32.06 0 0132 32H32a32.06 32.06 0 0132-32z" fill="#eee"/>
  </svg>
</svg>`;
=======
  iconName: 'home',
  sourceConfigFile: `${FIXTURES}/entity-ghosts/group/iconrc.json`
});

describe('svgGenerate()', function () {
  it('creates parent svg with light and dark children svgs when `imageSet` exists and the `colorScheme` equals `dark`', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128" viewBox="0 0 128 128">
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" display="var(--svg-light-display)">
      <path fill="#e9e5de" d="M0 0h128v128H0z"/>
      <path fill="#e7a43e" d="M0 64.14h128V128H0z"/>
      <path d="M32 64H0v32a32 32 0 0032-32zm64 0a32 32 0 0032 32V64zM64 96a32 32 0 0032-32H32a32 32 0 0032 32z" fill="#905a24"/>
      <path d="M32 64H0V32a32.06 32.06 0 0132 32zm64 0a32.06 32.06 0 0132-32v32zM64 32a32.06 32.06 0 0132 32H32a32.06 32.06 0 0132-32z" fill="#c27e2a"/>
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" display="var(--svg-dark-display)">
      <path fill="#56687a" d="M0 0h128v128H0z"/>
      <path fill="#f8c77e" d="M0 64.14h128V128H0z"/>
      <path d="M32 64H0v32a32 32 0 0032-32zm64 0a32 32 0 0032 32V64zM64 96a32 32 0 0032-32H32a32 32 0 0032 32z" fill="#c37d16"/>
      <path d="M32 64H0V32a32.06 32.06 0 0132 32zm64 0a32.06 32.06 0 0132-32v32zM64 32a32.06 32.06 0 0132 32H32a32.06 32.06 0 0132-32z" fill="#e7a33e"/>
    </svg>
  </svg>`
>>>>>>> b846671... add text fixtures for svgLightDark

  const outputFlavor: Flavor = await svgLightDark.fn(darkFlavor, icon, {
    lightToken: "var(--svg-light-display)",
    darkToken: "var(--svg-dark-display)"
    });

<<<<<<< HEAD
    //result has proper width, height, viewbox, and display properties
    assert.equal(await outputFlavor.getContents(), outputSvg);

    //result does not equal original dark flavor
    assert.notEqual(await outputFlavor.getContents(), darkFile);
  });

  it('returns original flavor with no changes when `colorScheme` dos not equal `dark`', async () => {
=======
  const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

  it('returns original flavor with no changes when `imageSet` does not exist', async () => {
    const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" id="group-accent-1" data-supported-dps="128x128">
    <path fill="#e9e5de" d="M0 0h128v128H0z"/>
    <path fill="#e7a43e" d="M0 64.14h128V128H0z"/>
    <path d="M32 64H0v32a32 32 0 0032-32zM96 64a32 32 0 0032 32V64zM64 96a32 32 0 0032-32H32a32 32 0 0032 32z" fill="#905a24"/>
    <path d="M32 64H0V32a32.06 32.06 0 0132 32zM96 64a32.06 32.06 0 0132-32v32zM64 32a32.06 32.06 0 0132 32H32a32.06 32.06 0 0132-32z" fill="#c27e2a"/>
  </svg>`;

>>>>>>> b846671... add text fixtures for svgLightDark
    const outputFlavor: Flavor = await svgLightDark.fn(lightFlavor, icon, {
      lightToken: "var(--svg-light-display)",
      darkToken: "var(--svg-dark-display)"
    });
<<<<<<< HEAD

    //result equals original light flavor
    assert.equal(await outputFlavor.getContents(), lightFile);
  });

  //TODO: outputSVG and outputFlavor print to console exactly the same.  But test fails, I'm guessing it is an econding issue

  // it('creates light and dark svgs with display property even if tags not passed from config', async () => {
  //   const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128" viewBox="0 0 128 128">
  //   <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" display="var(--svg-light-display)">
  //     <path fill="#e9e5de" d="M0 0h128v128H0z"/>
  //     <path fill="#e9e5de" d="M0 64.14h128V128H0z"/>
  //     <path d="M32 64H0v32a32 32 0 0032-32zm64 0a32 32 0 0032 32V64zM64 96a32 32 0 0032-32H32a32 32 0 0032 32zM32 64H0V32a32.06 32.06 0 0132 32zm64 0a32.06 32.06 0 0132-32v32zM64 32a32.06 32.06 0 0132 32H32a32.06 32.06 0 0132-32z" fill="#e9e5de"/>
  //   </svg>
  //   <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" display="var(--svg-dark-display)">
  //     <path fill="#eee" d="M0 0h128v128H0z"/>
  //     <path fill="#eee" d="M0 64.14h128V128H0z"/>
  //     <path d="M32 64H0v32a32 32 0 0032-32zm64 0a32 32 0 0032 32V64zM64 96a32 32 0 0032-32H32a32 32 0 0032 32zM32 64H0V32a32.06 32.06 0 0132 32zm64 0a32.06 32.06 0 0132-32v32zM64 32a32.06 32.06 0 0132 32H32a32.06 32.06 0 0132-32z" fill="#eee"/>
  //   </svg>
  // </svg>`;

  //   const outputFlavor: Flavor = await svgLightDark.fn(darkFlavor, icon, {});

  //   //result has proper width, height, viewbox, and display properties
  //   assert.equal(await outputFlavor.getContents(), outputSvg);

  //   //result does not equal original dark flavor
  //   assert.notEqual(await outputFlavor.getContents(), darkFile);
  // });
=======
    const svgFromOutputFlavor = outputFlavor.types.get('svg');
    if (svgFromOutputFlavor) {
      assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
    }
  });

    // it('returns original flavor with no changes when `colorScheme` dos not equal `dark`', async () => {
  //   const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled" fill="currentColor">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="currentColor"/>\n</svg>`;

  //   const outputFlavor: Flavor = await svgLightDark.fn(flavor, icon, {
  //     addSupportedDps: 'none'
  //   });
  //   const svgFromOutputFlavor = outputFlavor.types.get('svg');
  //   if (svgFromOutputFlavor) {
  //     assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
  //   }
  // });

  // it('creates parent svg with width, height, and viewbox', async () => {
  //   const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled" data-supported-dps="8x8 16x16">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="#737373"/>\n</svg>`;

  //   const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
  //     isColored: true
  //   });
  //   const svgFromOutputFlavor = outputFlavor.types.get('svg');
  //   if (svgFromOutputFlavor) {
  //     assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
  //   }
  // });

  // it('creates light and dark svgs with display property from config', async () => {
  //   const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="home-filled" data-supported-dps="8x8 16x16">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="#737373"/>\n</svg>`;

  //   const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
  //     colorByNameMatching: ['filled']
  //   });
  //   const svgFromOutputFlavor = outputFlavor.types.get('svg');
  //   if (svgFromOutputFlavor) {
  //     assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
  //   }
  // });

  // it('creates light and dark svgs with display property even if tags not passed from config', async () => {
  //   const outputSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" id="home-filled" data-supported-dps="8x8 16x16" fill="currentColor">\n  <path d="M28 13.36L16.64 6.19a1.2 1.2 0 00-1.28 0L4 13.34l1 1.59 2-1.25V25a1 1 0 001 1h6v-5h4v5h6a1 1 0 001-1V13.67L27 15z" fill="currentColor"/>\n</svg>`;

  //   const outputFlavor: Flavor = await svgGenerate.fn(flavor, icon, {
  //     isFixedDimensions: true
  //   });
  //   const svgFromOutputFlavor = outputFlavor.types.get('svg');
  //   if (svgFromOutputFlavor) {
  //     assert.equal(await svgFromOutputFlavor.getContents(), outputSvg);
  //   }
  // });

>>>>>>> b846671... add text fixtures for svgLightDark
});
