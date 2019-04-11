import * as assert from 'assert';

import { Asset, BuildPlugin, Flavor } from '../src';
import { Icon } from '../src/icon';
import {
  applyPluginsOnAsset,
  getAllPropCombinations
} from '../src/plugin-manager';
import { getNameFromPropCombo } from '../src/utils/prop-combinator';

import { idealIcon } from './helpers/ideal-icon';
import {
  complexIterantProps,
  simpleIterantProps
} from './helpers/iterant-properties';

describe('plugin-manager', function() {
  it('getAllPropCombinations() works with simple iterants', async () => {
    const sampleIcon = new Icon(idealIcon);

    assert.deepEqual(
      getAllPropCombinations(sampleIcon, ['sizes', 'resolutions']),
      simpleIterantProps
    );
  });

  it('getAllPropCombinations() works with objects as iterants', async () => {
    const idealIconWithAnExtraProp = Object.assign(idealIcon, {
      iterant3: [{ a: 'object here' }]
    });
    const sampleIcon = new Icon(idealIconWithAnExtraProp);
    assert.deepEqual(
      getAllPropCombinations(sampleIcon, ['sizes', 'resolutions', 'iterant3']),
      complexIterantProps
    );
  });

  it('applyPluginsOnIcon() for simple iterants', async () => {
    const sampleIcon = new Icon(idealIcon);

    let results: Asset[] = [];
    if (sampleIcon.build && sampleIcon.build.plugins) {
      results = await applyPluginsOnAsset(
        sampleIcon.variants[0],
        sampleIcon,
        sampleIcon.build.plugins
      );
    }
    assert.equal(results.length, 16);
  });

  it("applyPluginsOnIcon() throws an error if the iterants aren't present in the config", async () => {
    try {
      const sampleIcon = new Icon(idealIcon);
      await applyPluginsOnAsset(sampleIcon.variants[0], sampleIcon, [
        {
          name: 'p1',
          fn: async (flavor: Flavor, _icon: Icon, params?: object) => {
            return {
              name: getNameFromPropCombo(flavor.name, params),
              contents: 'p1'
            };
          },
          iterants: ['fieldOfMonkeys'],
          writeToOutput: true
        } as BuildPlugin
      ]);
    } catch (err) {
      assert.ok(true);
    }
  });

  it('applyPluginsOnIcon() Iterates through a series of iterants', async () => {
    const sampleIcon = new Icon(idealIcon);
    let results = [];

    if (
      sampleIcon.build &&
      sampleIcon.build.plugins &&
      sampleIcon.build.plugins[0]
    ) {
      results = await applyPluginsOnAsset(
        sampleIcon.variants[0],
        sampleIcon,
        new Array(sampleIcon.build.plugins[1])
      );
    }

    assert.equal(results.length, 4);
  });

  it('applyPluginsOnIcon() Applies multiple plugins', async () => {
    const sampleIcon = new Icon(idealIcon);
    let results = [];

    if (
      sampleIcon.build &&
      sampleIcon.build.plugins &&
      sampleIcon.build.plugins[0]
    ) {
      results = await applyPluginsOnAsset(
        sampleIcon.variants[0],
        sampleIcon,
        new Array(sampleIcon.build.plugins[0], sampleIcon.build.plugins[1])
      );
    }
    assert.equal(results.length, 8);
  });
});
