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
      path: './filled.svg'
    };
    const asset = new Asset(path.resolve(__dirname, iconPath), assetContent);

    assert.ok(path.isAbsolute(asset.path), 'always returns an absolute path');

    assert.equal(
      asset.path,
      path.join(__dirname, './fixtures/nav-icons/home/filled.svg'),
      'is resolved with respect to the iconPath'
    );

    assert.deepEqual(
      filledContent.trim(),
      await asset.getContents(),
      'reads the file correctly'
    );

    assert.deepEqual(
      asset.config,
      assetContent,
      'config is the original content'
    );
  });
});
