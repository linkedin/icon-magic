import * as assert from 'assert';

import { Icon } from '../src/icon';
import { idealIcon } from './helpers/ideal-icon';

let outlineSvg =
  '<svg\n  id="Layer_1"\n  data-name="Layer 1"\n  xmlns="http://www.w3.org/2000/svg"\n  width="32"\n  height="32"\n  viewBox="0 0 32 32"\n>\n  <title>32dp</title>\n  <path d="M28,13.36L16.64,6.19a1.2,1.2,0,0,0-1.28,0L4,13.34l1,1.59,2-1.25V25a1,1,0,0,0,1,1h6V21h4v5h6a1,1,0,0,0,1-1V13.67L27,15Z" />\n</svg>';

describe('@icon-magic/icon-models/icon', function() {
  it('getContents()', async () => {
    let icon = new Icon(idealIcon);
    let iconContent = await icon.variants[0].getContents();
    assert.equal(iconContent, outlineSvg);
  });

  it('Icon to config conversion works correctly', async () => {
    let icon = new Icon(idealIcon);
    assert.deepEqual(icon.config.variants, idealIcon.variants);
  });
});
