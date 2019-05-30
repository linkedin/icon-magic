import * as configReader from '@icon-magic/config-reader';
import * as assert from 'assert';
import * as path from 'path';

import { distributeByType } from '../src';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
const input = path.resolve(FIXTURES, 'input');
const output = path.resolve(FIXTURES, 'out');
const iconSet = configReader.getIconConfigSet(new Array(input));

describe('Test test', function() {
  it('Moves all .png files to the output directory', async () => {
    await distributeByType(iconSet, output, 'png', false);
    assert.ok(true, 'Accesses exports');
  });

  it('creates the sprite', async () => {
    await distributeByType(iconSet, output, 'svg', true);
    assert.ok(true, 'Accesses exports');
  });
});
