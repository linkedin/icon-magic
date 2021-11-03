import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';

import { Asset } from './../src/asset';

describe('@icon-magic/icon-models/asset', function() {
  it('Instantiates the asset correctly', async () => {
    const iconPath = './fixtures/nav-icons/home/';
    const filledContent = await fs.readFile(
      path.resolve(__dirname, iconPath, 'filled.svg'),
      { encoding: 'utf8' }
    );
    const assetContent = {
      name: 'filled',
      path: './filled.svg',
      sizes: [32]
    };
    const asset = new Asset(path.resolve(__dirname, iconPath), assetContent);

    assert.ok(path.isAbsolute(asset.getPath()), 'always returns an absolute path');

    assert.strictEqual(
      asset.getPath(),
      path.join(__dirname, './fixtures/nav-icons/home/filled.svg'),
      'is resolved with respect to the iconPath'
    );

    assert.deepStrictEqual(
      filledContent.trim(),
      await asset.getContents(),
      'reads the file correctly'
    );

    assert.deepStrictEqual(
      asset.getAssetConfig(),
      assetContent,
      'config is the original content'
    );
  });
});
