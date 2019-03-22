import * as assert from 'assert';
import * as path from 'path';

import { getIconSetwithConfigs } from '../src/index';

describe('@icon-magic/config-reader/index', function() {
  it('Resolves all paths in the config files correctly', async () => {
    const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

    let expectedOutput = new Map([
      [
        `${FIXTURES}/nav-icons/home`,
        {
          iconPath: `${FIXTURES}/nav-icons/home`,
          variants: [
            {
              path: `${FIXTURES}/nav-icons/home/filled.svg`,
              name: 'filled'
            },
            {
              path: `${FIXTURES}/nav-icons/home/outline.svg`,
              name: 'someOtherName'
            }
          ],
          build: { outputPath: './../dist' },
          iconName: 'home',
          sourceConfigFile: `${FIXTURES}/nav-icons/iconrc.json`
        }
      ],
      [
        `${FIXTURES}/nav-icons/small-home`,
        {
          iconPath: `${FIXTURES}/nav-icons/small-home`,
          iconName: 'modified-small-home',
          variants: [
            {
              path: `${FIXTURES}/nav-icons/small-home/filled.svg`,
              name: 'filled'
            },
            {
              path: `${FIXTURES}/nav-icons/small-home/modifiedOutline.svg`,
              name: 'modifiedOutline'
            }
          ],
          build: { outputPath: './../dist' },
          sourceConfigFile: `${FIXTURES}/nav-icons/small-home/iconrc.json`
        }
      ]
    ]);
    let iconSet = getIconSetwithConfigs([FIXTURES]);

    assert.deepEqual(iconSet, new Map(expectedOutput));
  });
});
