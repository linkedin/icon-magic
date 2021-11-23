import { Flavor, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';

import { svgLightDark } from '../src/plugins/svg-light-dark';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

const lightFile = fs.readFileSync(
  path.resolve(`${FIXTURES}/entity-ghosts/group/accent-1.svg`).toString(), 'utf-8'
);

const darkFile = fs.readFileSync(
  path.resolve(`${FIXTURES}/entity-ghosts/group/accent-1-on-dark.svg`).toString(), 'utf-8'
);

const lightFlavor: Flavor = new Flavor(`${FIXTURES}/entity-ghosts/group/accent-1.svg`, {
  name: 'accent-1',
  contents: lightFile,
  path: `${FIXTURES}/entity-ghosts/group/accent-1.svg`,
  imageset: 'accent-1',
  colorScheme: 'light'
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
      name: 'accent-1',
      imageset: 'accent-1',
      colorScheme: 'light'
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
  it('creates parent svg with light and dark children svgs when `imageset` exists and the `colorScheme` equals `dark`', async () => {

  const outputSvgStripped: string = `
    <svg id="group-accent-1" xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <svg display="var(--hue-web-svg-display-dark)">
        <rect width="128" height="128" style="fill: #eee"/>
        <rect y="64.14" width="128" height="63.86" style="fill: #eee"/>
        <path d="M32,64H0V96A32,32,0,0,0,32,64Z" style="fill: #eee"/>
        <path d="M96,64a32,32,0,0,0,32,32V64Z" style="fill: #eee"/>
        <path d="M64,96A32,32,0,0,0,96,64H32A32,32,0,0,0,64,96Z" style="fill: #eee"/>
        <path d="M32,64H0V32A32.06,32.06,0,0,1,32,64Z" style="fill: #eee"/>
        <path d="M96,64a32.06,32.06,0,0,1,32-32V64Z" style="fill: #eee"/>
        <path d="M64,32A32.06,32.06,0,0,1,96,64H32A32.06,32.06,0,0,1,64,32Z" style="fill: #eee"/>
      </svg>
      <svg display="var(--hue-web-svg-display-light)">
        <rect width="128" height="128" style="fill: #e9e5de"/>
        <rect y="64.14" width="128" height="63.86" style="fill: #e9e5de"/>
        <path d="M32,64H0V96A32,32,0,0,0,32,64Z" style="fill: #e9e5de"/>
        <path d="M96,64a32,32,0,0,0,32,32V64Z" style="fill: #e9e5de"/>
        <path d="M64,96A32,32,0,0,0,96,64H32A32,32,0,0,0,64,96Z" style="fill: #e9e5de"/>
        <path d="M32,64H0V32A32.06,32.06,0,0,1,32,64Z" style="fill: #e9e5de"/>
        <path d="M96,64a32.06,32.06,0,0,1,32-32V64Z" style="fill: #e9e5de"/>
        <path d="M64,32A32.06,32.06,0,0,1,96,64H32A32.06,32.06,0,0,1,64,32Z" style="fill: #e9e5de"/>
      </svg>
    </svg>`.replace(/\s+/g, '');

  const outputFlavor: Flavor = await svgLightDark.fn(darkFlavor, icon, {
    lightToken: "--hue-web-svg-display-light",
    darkToken: "--hue-web-svg-display-dark"
    });

    const outputFlavorBuffer = await outputFlavor.getContents();
    const outputFlavorStringStripped = outputFlavorBuffer.toString('utf-8').replace(/\s+/g, '');

    //result has proper width, height, viewbox, and display properties
    assert.equal(outputFlavorStringStripped, outputSvgStripped);

    //result does not equal original dark flavor
    assert.notEqual(outputFlavorBuffer, darkFile);
  });

  it('returns original flavor with no changes when `colorScheme` dos not equal `dark`', async () => {
    const outputFlavor: Flavor = await svgLightDark.fn(lightFlavor, icon, {
      lightToken: "--hue-web-svg-display-light",
      darkToken: "--hue-web-svg-display-dark"
    });

    //result equals original light flavor
    assert.equal(await outputFlavor.getContents(), lightFile);
  });

  it('creates mixed svg with display property even if light/dark tags not passed from config', async () => {
    const outputSvgStripped: string = `
    <svg id="group-accent-1" xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <svg display="var(--svg-display-dark)">
        <rect width="128" height="128" style="fill: #eee"/>
        <rect y="64.14" width="128" height="63.86" style="fill: #eee"/>
        <path d="M32,64H0V96A32,32,0,0,0,32,64Z" style="fill: #eee"/>
        <path d="M96,64a32,32,0,0,0,32,32V64Z" style="fill: #eee"/>
        <path d="M64,96A32,32,0,0,0,96,64H32A32,32,0,0,0,64,96Z" style="fill: #eee"/>
        <path d="M32,64H0V32A32.06,32.06,0,0,1,32,64Z" style="fill: #eee"/>
        <path d="M96,64a32.06,32.06,0,0,1,32-32V64Z" style="fill: #eee"/>
        <path d="M64,32A32.06,32.06,0,0,1,96,64H32A32.06,32.06,0,0,1,64,32Z" style="fill: #eee"/>
      </svg>
      <svg display="var(--svg-display-light)">
        <rect width="128" height="128" style="fill: #e9e5de"/>
        <rect y="64.14" width="128" height="63.86" style="fill: #e9e5de"/>
        <path d="M32,64H0V96A32,32,0,0,0,32,64Z" style="fill: #e9e5de"/>
        <path d="M96,64a32,32,0,0,0,32,32V64Z" style="fill: #e9e5de"/>
        <path d="M64,96A32,32,0,0,0,96,64H32A32,32,0,0,0,64,96Z" style="fill: #e9e5de"/>
        <path d="M32,64H0V32A32.06,32.06,0,0,1,32,64Z" style="fill: #e9e5de"/>
        <path d="M96,64a32.06,32.06,0,0,1,32-32V64Z" style="fill: #e9e5de"/>
        <path d="M64,32A32.06,32.06,0,0,1,96,64H32A32.06,32.06,0,0,1,64,32Z" style="fill: #e9e5de"/>
      </svg>
    </svg>`.replace(/\s+/g, '');

    const outputFlavor: Flavor = await svgLightDark.fn(darkFlavor, icon, {});

    const outputFlavorBuffer = await outputFlavor.getContents();
    const outputFlavorStringStripped = outputFlavorBuffer.toString('utf-8').replace(/\s+/g, '');

    //result has proper width, height, viewbox, and display properties
    assert.equal(outputFlavorStringStripped, outputSvgStripped);

    //result does not equal original dark flavor
    assert.notEqual(outputFlavorBuffer, darkFile);
  });
});
