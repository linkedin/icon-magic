import * as assert from 'assert';
import {
  applyPluginsOnAsset,
  getAllPropCombinations
} from '../src/plugin-manager';
import {
  simpleIterantProps,
  complexIterantProps
} from './helpers/iterant-properties';
import { Icon } from '../src/icon';
import { idealIcon } from './helpers/ideal-icon';
import { getNameFromPropCombo } from '../src/utils/prop-combinator';
import { Flavor, BuildPlugin, Asset } from '../src';

describe('plugin-manager', function() {
  it('getAllPropCombinations() works with simple iterants', async () => {
    let sampleIcon = new Icon(idealIcon);

    assert.deepEqual(
      getAllPropCombinations(sampleIcon, ['sizes', 'resolutions']),
      simpleIterantProps
    );
  });

  it('getAllPropCombinations() works with objects as iterants', async () => {
    let idealIconWithAnExtraProp = Object.assign(idealIcon, {
      iterant3: [{ a: 'object here' }]
    });
    let sampleIcon = new Icon(idealIconWithAnExtraProp);
    assert.deepEqual(
      getAllPropCombinations(sampleIcon, ['sizes', 'resolutions', 'iterant3']),
      complexIterantProps
    );
  });

  it('applyPluginsOnIcon() for simple iterants', async () => {
    let sampleIcon = new Icon(idealIcon);

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
      let sampleIcon = new Icon(idealIcon);
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
    let sampleIcon = new Icon(idealIcon);
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
    let sampleIcon = new Icon(idealIcon);
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
