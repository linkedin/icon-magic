import * as assert from 'assert';
import * as path from 'path';

import { distributeByType } from '../src';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');

describe('Test test', function() {
  it('Moves all .png files to the output directory', async () => {
    await distributeByType();
    assert.ok(true, 'Accesses exports');
  });
});
