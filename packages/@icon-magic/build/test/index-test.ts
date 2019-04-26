import { Asset, Icon } from '@icon-magic/icon-models';
import * as assert from 'assert';

import { applyBuildPluginsOnVariants } from './../src/index';
import { idealIcon } from './helpers/ideal-icon';

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
});
