import * as assert from 'assert';
import * as path from 'path';

import { getIconConfigSet } from '../src';

describe('@icon-magic/config-reader/index', function(): void {
  it('Resolves all paths in the config files correctly', async () => {
    const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

    const expectedOutput = new Map([
      [
        '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/home',
        {
          iconPath:
            '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/home',
          variants: [
            { path: './filled.svg' },
            { name: 'someOtherName', path: './outline.svg' }
          ],
          sizes: [24],
          resolutions: [1],
          build: { outputPath: './out' },
          generate: {
            outputPath: './out',
            types: [
              { name: 'svg', plugins: [] },
              { name: 'raster', plugins: [] }
            ]
          },
          sourceConfigFile:
            '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/iconrc.json'
        }
      ],
      [
        '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/small-home',
        {
          iconPath:
            '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/small-home',
          iconName: 'modified-small-home',
          variants: [
            { name: 'filled', path: './filled.svg' },
            { name: 'modifiedOutline', path: './modifiedOutline.svg' }
          ],
          sizes: [8, 16],
          resolutions: [1, 2],
          build: { outputPath: './out' },
          generate: {
            outputPath: './out',
            types: [
              { name: 'svg', plugins: [] },
              { name: 'raster', plugins: [] }
            ]
          },
          sourceConfigFile:
            '/Users/rchitloo/workspace/icon-magic/packages/@icon-magic/config-reader/test/fixtures/nav-icons/small-home/iconrc.json'
        }
      ]
    ]);
    const configSet = getIconConfigSet([FIXTURES]);

    assert.deepEqual(configSet, new Map(expectedOutput));
  });
});
