import { getIconConfigSet } from '@icon-magic/config-reader';
import { Asset, Flavor, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

import { applyBuildPluginsOnVariants, build } from './../src/index';
import { idealIcon } from './helpers/ideal-icon';
const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

describe('Build tests', function() {
  it('applyBuildPluginsOnVariants() applies all sorts of plugins', async () => {
    const sampleIcon = new Icon(idealIcon);
    let assets: Asset[] = [];

    if (sampleIcon.build && sampleIcon.build.plugins) {
      assets = await applyBuildPluginsOnVariants(
        sampleIcon,
        sampleIcon.build.plugins
      );
    }

    // check that the plugin has been applied
    assets.forEach(asset => {
      assert.equal(asset.contents, 'p3'); //contents of the last plugin
    });

    // check that the number of assets returned are 32
    assert.equal(assets.length, 32);
  });

  it('it builds the icon properly', async () => {
    const input = path.resolve(FIXTURES, 'input');
    const iconConfig = getIconConfigSet(new Array(input));
    const outputIconSet = await build(iconConfig);
    assert.ok(outputIconSet.hash, 'returns an output iconSet');
    outputIconSet.hash.forEach((icon: Icon, s: string) => {
      const iconPath = `${FIXTURES}/out/${path.basename(s)}/build`;
      try {
        const files = fs.readdirSync(iconPath);
        assert.ok(files.includes('filled.svg'));
      } catch (e) {
        assert.ok(
          false,
          `Does not write the asset\'s contents onto the outputPath. ${e}`
        );
      }
      const flavors = icon.flavors;
      assert.ok(
        Array.from(flavors.values()).every((flav: Flavor) => !!flav.sourceHash),
        'All flavors have a source hash'
      );
    });
  });
});
