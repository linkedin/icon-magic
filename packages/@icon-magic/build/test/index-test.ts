import { getIconConfigSet } from '@icon-magic/config-reader';
import { Asset, Flavor, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

import {
  applyBuildPluginsOnVariants,
  build,
  saveAssetAsFlavor
} from './../src/index';
import { idealIcon, lastBuildPluginUpdated } from './helpers/ideal-icon';
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
        Array.from(flavors.values()).every((flav: Flavor) => !!flav.buildSourceHash),
        'All flavors have a build source hash'
      );
    });
  });

  it('does not run build again if hashing is enabled', async () => {
    const sampleIcon = new Icon(idealIcon);
    let assets: Asset[] = [];

    // Run the build plugin the first time
    if (sampleIcon.build && sampleIcon.build.plugins) {
      assets = await applyBuildPluginsOnVariants(
        sampleIcon,
        sampleIcon.build.plugins
      );
      sampleIcon.build.plugins[2] = lastBuildPluginUpdated;
    }

    // Make sure it was run correctly
    // check that the plugin has been applied
    assets.forEach(asset => {
      assert.equal(asset.contents, 'p3'); //contents of the last plugin
    });

    // check that the number of assets returned are 32
    assert.equal(assets.length, 32);

    // Save the assets to the icon
    await Promise.all(
      assets.map(asset => saveAssetAsFlavor(asset, sampleIcon, 'test-imgs'))
    );

    if (sampleIcon.build && sampleIcon.build.plugins) {
      // when an icon config is passed to this function, that means build has been run before
      assets = await applyBuildPluginsOnVariants(
        sampleIcon,
        sampleIcon.build.plugins,
        sampleIcon.getConfig()
      );
    }

    // Even though the plugin is NOT run the second time we should have the same number of assets
    assert.equal(assets.length, 32);

    // Should not run lastBuildPluginUpdated which changes the contents
    assets.forEach(async asset => {
      const contents = await asset.getContents();
      assert.equal(contents, 'p3'); // contents of the last plugin
    });

    // Just to make sure lastBuildPluginUpdated actually works
    if (sampleIcon.build && sampleIcon.build.plugins) {
      assets = await applyBuildPluginsOnVariants(
        sampleIcon,
        sampleIcon.build.plugins
      );
    }

    assets.forEach(asset => {
      assert.equal(asset.contents, 'p3x2'); //contents of the last plugin
    });
  });
});
