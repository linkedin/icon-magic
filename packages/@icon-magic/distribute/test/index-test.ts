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

describe('distribute works as expected', function() {
  it('Moves all .webp files to the right output directory', async () => {
    await distributeByType(iconSet, output, 'webp', false);
    const iconPath = `${output}/drawable-xxxhdpi`;
    try {
      if (fs.existsSync(iconPath)) {
        assert.ok(`${iconPath} dir was generated`);
      }
      else {
        assert.ok(false, `${iconPath} dir was not generated` );
      }
    }
    catch(err) {
      assert.ok(false, `${err} reading ${iconPath}`);
    }
  });

  it('.webp files are in the right output directory', async () => {
    await distributeByType(iconSet, output, 'webp', false);
    const iconPath = `${output}/drawable-xxxhdpi`;
    const icons = [
      {
        iconName: 'filled-1_filled-24x12@2',
       },
       {
        iconName: 'filled-2_filled-24x12@2'
      },
      {
        iconName: 'filled-3_filled-24x12@2'
      },
      {
        iconName: 'filled-1_filled-60x60@2'
      },
    ];
    const files = fs.readdirSync(iconPath);
    icons.forEach(icon => {
      assert.ok(files.includes(`${icon.iconName}.webp`));
    });
  });

  it('Moves all .png files to the output directory', async () => {
    const icons = [
      {
        iconName: 'filled-1_filled-24x12',
       },
       {
        iconName: 'filled-2_filled-24x12'
      },
      {
        iconName: 'filled-3_filled-24x12'
      },
      {
        iconName: 'filled-1_filled-60x60'
      },
    ];
    await distributeByType(iconSet, output, 'png', false);
    icons.forEach(icon => {
      try {
        const iconPath = `${output}/${icon.iconName}.imageset`;
        if (fs.existsSync(iconPath)) {
          assert.ok(`${iconPath} dir was generated`);
          const files = fs.readdirSync(iconPath);
          assert.ok(files.indexOf('Contents.json') > -1, 'Contents.json was generated');
          assert.ok(files.indexOf(`${icon.iconName}@2.png`) > -1, `${icon.iconName}@2.png was created`);
        }
        else {
          assert.ok(false, `Missing files for ${iconPath}`);
        }
      } catch(err) {
        assert.ok(false, err);
      }
    });
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
          assert.ok(false, `${p} was not generated`);
        }
      } catch(err) {
        assert.ok(false, `${p} was not generated: ${err}`);
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
        const defs = doc.getElementById(p.category);
        assert.ok(defs && defs.tagName === 'defs', 'has <defs> element with the right ID');
        assert.ok(doc.getElementById(p.id), 'has SVG with right ID');
      } catch(err) {
        assert.ok(false, `${err} with ${p.category}`);
      }
    });
  });
});
