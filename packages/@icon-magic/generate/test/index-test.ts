import { getIconConfigSet } from '@icon-magic/config-reader';
import { Flavor } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser } from 'xmldom';

import { generateFromConfigHash } from '../src';
const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
const output = path.resolve(FIXTURES, 'out');

describe('Generate test', function() {
  it('runs the generate plugins correctly', async () => {
    const input = path.resolve(FIXTURES, 'nav-icons/home-2');
    // generate all the icons
    await generateFromConfigHash(getIconConfigSet(new Array(input)), false);
    const iconPath = `${output}/home-2/ads`;
    try {
      if (fs.existsSync(iconPath)) {
        assert.ok(`${iconPath} dir was generated`);
      } else {
        assert.ok(false, `${iconPath} dir was not generated`);
      }
    } catch (err) {
      assert.ok(false, `${err} reading ${iconPath}`);
    }
    let content = await fs.readFileSync(`${iconPath}/active-small.svg`, 'utf8');
    assert.ok(content);
    let doc = new DOMParser().parseFromString(content, 'svg');
    const svgEl = doc.documentElement;
    let width = svgEl.getAttribute('width');
    assert.equal(width, 24, 'svg has correct width');
    assert.equal(
      svgEl.getElementsByTagName('path').length,
      2,
      'svg has two paths'
    );
    // Load the config
    let origOutputIconConfig = JSON.parse(
      fs.readFileSync(path.resolve(iconPath, 'iconrc.json'), 'utf8')
    );
    assert.equal(origOutputIconConfig.flavors.length, 12, 'no hashing, the number of flavors is correct');
    origOutputIconConfig.flavors.forEach((flav: Flavor) => {
      assert.ok(flav.generateSourceHash, 'all flavors have hash');
      assert.ok(Object.keys(flav.types).length, 'flavors have types');
    });

    // Change the config
    const iconrcPath = path.resolve(
      FIXTURES,
      'nav-icons/home-2/build/iconrc.json'
    );
    const iconrc = JSON.parse(fs.readFileSync(iconrcPath, 'utf8'));
    const tempPlugin = [
      {
        name: 'svg-generate',
        params: {
          addSupportedDps: 'current',
          colorByNameMatching: ['inverse'],
          isFixedDimensions: false // isFixedDimensions removes the width and height
        }
      }
    ];
    iconrc.generate.types.find(
      (type: { name: String; plugins: Array<Object> }) => type.name === 'svg'
    ).plugins = tempPlugin;
    await fs.writeFileSync(iconrcPath, JSON.stringify(iconrc));

    // Run generate again, this time plugins should not run
    await generateFromConfigHash(getIconConfigSet(new Array(input)), true);
    content = fs.readFileSync(`${iconPath}/active-small.svg`, 'utf8');
    assert.ok(content);
    doc = new DOMParser().parseFromString(content, 'svg');
    width = doc.documentElement.getAttribute('width');

    // svg was not changed
    assert.equal(width, 24, 'svg should not change');
    origOutputIconConfig = JSON.parse(
      fs.readFileSync(path.resolve(iconPath, 'iconrc.json'), 'utf8')
    );
    assert.equal(origOutputIconConfig.flavors.length, 12, 'hashing true, the number of flavors is correct');
    origOutputIconConfig.flavors.forEach((flav: Flavor) => {
      assert.ok(flav.generateSourceHash, 'all flavors have hash');
      assert.ok(Object.keys(flav.types).length, 'flavors have types');
    });

    // Run generate again, this time plugins should run cause hashing is turned off
    await generateFromConfigHash(getIconConfigSet(new Array(input)), false);
    content = fs.readFileSync(`${iconPath}/active-small.svg`, 'utf8');
    assert.ok(content);
    doc = new DOMParser().parseFromString(content, 'svg');
    width = doc.documentElement.getAttribute('width');
    // svg was not changed
    assert.notEqual(width, 24, 'svg should change, width should be removed.');

    // Write original iconrc back to disk
    await fs.copyFile(
      path.resolve(FIXTURES, 'nav-icons/home-2/build/orig.json'),
      iconrcPath
    );

    // Run generate again, hashing is true BUT the svg has been changed so plugins should run.
    const newSvg = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <title>24dp</title>
      <path d="M12,17.13A5.13,5.13,0,0,1,12,6.88V4a8,8,0,1,0,8,8H17.13A5.13,5.13,0,0,1,12,17.13Z" style="opacity: 0.75;isolation: isolate"/>
    </svg>`;
    const inputSvgPath = path.resolve(
      FIXTURES,
      `${input}/build/active-small.svg`
    );
    fs.writeFileSync(inputSvgPath, newSvg);
    await generateFromConfigHash(getIconConfigSet(new Array(input)), true);
    content = fs.readFileSync(`${iconPath}/active-small.svg`, 'utf8');
    assert.ok(content);
    doc = new DOMParser().parseFromString(content, 'svg');
    assert.equal(
      doc.documentElement.getElementsByTagName('path').length,
      1,
      'plugins should be run with changes svg.'
    );
    // Write original svg back to disk
    await fs.copyFile(
      path.resolve(FIXTURES, 'nav-icons/home-2/build/active-small-copy.svg'),
      inputSvgPath
    );
  });
});
