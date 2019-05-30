import * as configReader from '@icon-magic/config-reader';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser} from 'xmldom';

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

  it('creates the sprite files', async () => {
    await distributeByType(iconSet, output, 'svg', true);
    const spritePaths = [
      {
        path: 'icons-1.svg',
       },
       {
         path: 'icons-2.svg'
      },
      {
        path: 'icons-3.svg'
      }
    ];
    spritePaths.forEach(p => {
      try {
        if (fs.existsSync(`${output}/${p.path}`)) {
          assert.ok(`${p} was generated`);
        }
        else {
          assert.ok(false);
        }
      } catch(err) {
        assert.ok(false);
      }
    });
  });

  it('sprite files contain defs with category for ID', async () => {
    await distributeByType(iconSet, output, 'svg', true);
    const spritePaths = [
      {
        path: 'icons-1.svg',
        id: 'home-filled-1',
        category: 'ui-icon'
       },
       {
         path: 'icons-2.svg',
         id: 'home-filled-2',
         category: 'uix-icon'
      },
      {
        path: 'icons-3.svg',
        id: 'home-filled-3',
        category: 'uixx-icon'
      }
    ];
    spritePaths.forEach(p => {
      try {
        const content = fs.readFileSync(`${output}/${p.path}`, 'utf8');
        const doc = new DOMParser().parseFromString(content, 'svg');
        assert.ok(doc.getElementById(p.category));
        assert.ok(doc.getElementById(p.id), 'has SVG with right ID');
      } catch(err) {
        assert.ok(false, p.category);
      }
    });
  });
});
