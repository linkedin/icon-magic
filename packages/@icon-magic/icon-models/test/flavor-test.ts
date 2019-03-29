import * as path from 'path';
import * as fs from 'fs-extra';
import * as assert from 'assert';

import { flavors } from './helpers/ideal-icon';

import { Asset, Flavor } from '../src';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

describe('@icon-magic/icon-models/flavor', function() {
  it('instantiates the asset correctly', async () => {
    let iconPath = `${FIXTURES}/nav-icons/home/`;
    let filledContent = await fs.readFile(
      path.resolve(__dirname, iconPath, 'filled-a.svg'),
      { encoding: 'utf8' }
    );
    let flavor = new Flavor(path.resolve(__dirname, iconPath), flavors[0]);
    assert.ok(path.isAbsolute(flavor.path), 'always returns an absolute path');
    assert.equal(
      flavor.path,
      path.join(`${FIXTURES}/nav-icons/home/filled-a.svg`),
      'is resolved with respect to the iconPath'
    );
    assert.deepEqual(
      filledContent.trim(),
      await flavor.getContents(),
      'reads the file correctly'
    );
    assert.ok(
      flavor.types instanceof Map,
      'instantiates types if it is not passed in the constructor'
    );
    for (let asset of flavor.types.values()) {
      assert.ok(asset instanceof Asset, 'creates assets for each type value');
    }

    assert.deepEqual(
      flavor.config,
      flavors[0],
      'config is the original content'
    );
  });
});
