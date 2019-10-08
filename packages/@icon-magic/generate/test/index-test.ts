import { getIconConfigSet } from '@icon-magic/config-reader';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser } from 'xmldom';

import { generateFromConfigHash } from '../src';
const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
const output = path.resolve(FIXTURES, 'out');

describe('Test test', function() {
  it('runs the generate plugins', async () => {
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
    let content = fs.readFileSync(`${iconPath}/active-small.svg`, 'utf8');
    assert.ok(content);
    let doc = new DOMParser().parseFromString(content, 'svg');
    let width = doc.documentElement.getAttribute('width');
    assert.equal(width, 24);

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
          isFixedDimensions: false
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

    // Run generate again, this time plugins should run cause hashing is turned off
    await generateFromConfigHash(getIconConfigSet(new Array(input)), false);
    content = fs.readFileSync(`${iconPath}/active-small.svg`, 'utf8');
    assert.ok(content);
    doc = new DOMParser().parseFromString(content, 'svg');
    width = doc.documentElement.getAttribute('width');
    // svg was not changed
    assert.notEqual(width, 24, 'svg should change');

    // Write original iconrc back to disk
    await fs.copyFile(
      path.resolve(FIXTURES, 'nav-icons/home-2/build/orig.json'),
      iconrcPath
    );
  });
});
