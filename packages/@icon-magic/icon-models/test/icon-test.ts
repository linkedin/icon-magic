import * as assert from 'assert';

import { IconConfig } from '../src';
import { Icon } from '../src/icon';

import { idealIcon } from './helpers/ideal-icon';

const outlineSvg =
  '<svg\n  id="Layer_1"\n  data-name="Layer 1"\n  xmlns="http://www.w3.org/2000/svg"\n  width="32"\n  height="32"\n  viewBox="0 0 32 32"\n>\n  <title>32dp</title>\n  <path d="M28,13.36L16.64,6.19a1.2,1.2,0,0,0-1.28,0L4,13.34l1,1.59,2-1.25V25a1,1,0,0,0,1,1h6V21h4v5h6a1,1,0,0,0,1-1V13.67L27,15Z" />\n</svg>';

describe('@icon-magic/icon-models/icon', function() {
  it('getContents()', async () => {
    const icon = new Icon(idealIcon);
    const iconContent = await icon.variants[0].getContents();
    assert.equal(iconContent, outlineSvg);
  });

  it('Icon to config conversion works correctly', async () => {
    const icon = new Icon(idealIcon);
    assert.deepEqual(icon.getConfig().variants, idealIcon.variants);
  });

  it('skips a variant if it does not exit', async () => {
    const modifiedIcon = JSON.parse(JSON.stringify(idealIcon));

    Object.assign(modifiedIcon, {
      variants: [
        {
          path: './filled.svg'
        },
        {
          path: './abc.svg'
        }
      ]
    });

    const icon = new Icon(modifiedIcon as IconConfig);

    // only has abc as a variant
    assert(icon.variants.length === 1);
  });

  it('throws an error if there are no valid variants', async () => {
    const modifiedIcon = JSON.parse(JSON.stringify(idealIcon));

    Object.assign(modifiedIcon, {
      variants: [
        {
          path: './abc.svg'
        }
      ]
    });

    assert.throws(() => {
      const icon = new Icon(modifiedIcon as IconConfig);
      assert(icon.variants.length === 0);
    }, /NoValidVariants/);
  });
});
