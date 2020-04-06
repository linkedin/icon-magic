import * as configReader from '@icon-magic/config-reader';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser } from 'xmldom';

import { distributeByType } from '../src';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
const input = path.resolve(FIXTURES, 'input');
const output = path.resolve(FIXTURES, 'out');
const iconSet = configReader.getIconConfigSet(new Array(input));

describe('distribute works as expected', function () {
  it('Moves all .webp files to the right output directory', async () => {
    await distributeByType(iconSet, output, 'webp', false);
    const iconPath = `${output}/drawable-xxxhdpi`;
    try {
      if (fs.existsSync(iconPath)) {
        assert.ok(`${iconPath} dir was generated`);
      } else {
        assert.ok(false, `${iconPath} dir was not generated`);
      }
    } catch (err) {
      assert.ok(false, `${err} reading ${iconPath}`);
    }
  });

  it('.webp files are in the right output directory', async () => {
    await distributeByType(iconSet, output, 'webp', false);
    const iconPath = `${output}/drawable-xxxhdpi`;
    const icons = [
      {
        iconName: 'ui_icon_filled_1_filled_24x12'
      },
      {
        iconName: 'uix_icon_filled_2_filled_24x12'
      },
      {
        iconName: 'uixx_icon_filled_3_filled_24x12'
      },
      {
        iconName: 'ui_icon_filled_1_filled_60x60'
      },
      {
        iconName: 'ui_icon_filled_4_filled_24x12'
      },
      {
        iconName: 'ui_icon_filled_4_filled_60x60'
      },
      {
        iconName: 'ui_icon_2_filled_6_filled_24x12'
      },
      {
        iconName: 'ui_icon_2_filled_6_filled_60x60'
      }
    ];
    const files = fs.readdirSync(iconPath);
    icons.forEach(icon => {
      assert.ok(
        files.includes(`${icon.iconName}.webp`),
        `includes ${icon.iconName}.webp`
      );
    });
  });

  it('Moves all .png files to the output directory', async () => {
    const icons = [
      {
        iconName: 'filled_1_filled_24x12',
        category: 'ui-icon'
      },
      {
        iconName: 'filled_2_filled_24x12',
        category: 'uix-icon'
      },
      {
        iconName: 'filled_3_filled_24x12',
        category: 'uixx-icon'
      },
      {
        iconName: 'filled_1_filled_60x60',
        category: 'ui-icon'
      }
    ];
    await distributeByType(iconSet, output, 'png', false);

    icons.forEach(icon => {
      try {
        const iconPath = `${output}/${icon.category}/${icon.category}_${icon.iconName}.imageset`;
        if (fs.existsSync(iconPath)) {
          assert.ok(`${iconPath} dir was generated`);
          const files = fs.readdirSync(iconPath);
          assert.ok(
            files.indexOf('Contents.json') > -1,
            'Contents.json was generated'
          );
          assert.ok(
            files.indexOf(`${icon.category}_${icon.iconName}@2.png`) > -1,
            `${icon.category}_${icon.iconName}@2.png was created`
          );
        } else {
          assert.ok(false, `Missing files for ${iconPath}`);
        }
      } catch (err) {
        assert.ok(false, err);
      }
    });
  });

  it('creates the sprite files', async () => {
    await distributeByType(iconSet, output, 'svg', true);
    const spritePaths = [
      {
        path: 'icons.svg'
      },
      {
        path: 'icons-1.svg'
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
        } else {
          assert.ok(false, `${p} was not generated`);
        }
      } catch (err) {
        assert.ok(false, `${p} was not generated: ${err}`);
      }
    });
  });

  it('sprite files contain defs with category for ID', async () => {
    await distributeByType(iconSet, output, 'svg', true);
    const spritePaths = [
      {
        path: 'icons.svg',
        id: 'a-home-filled-1',
        category: 'ui-icon'
      },
      {
        path: 'icons.svg',
        id: 'point-default',
        category: 'app'
      },
      {
        path: 'icons.svg',
        id: 'point-default-2',
        category: 'app'
      },
      {
        path: 'icons.svg',
        id: 'ads-default',
        category: 'app'
      },
      {
        path: 'icons.svg',
        id: 'ads-default-2',
        category: 'app'
      },
      {
        path: 'icons-2.svg',
        id: 'b-home-filled-4',
        category: 'ui-icon'
      },
      {
        path: 'icons-1.svg',
        id: 'c-home-filled-8',
        category: 'ui-icon-2'
      },
      {
        path: 'icons-1.svg',
        id: 'c-home-filled-88-9',
        category: 'ui-icon-3'
      },
      {
        path: 'icons-1.svg',
        id: 'c-home-filled-889',
        category: 'ui-icon-2'
      },
      {
        path: 'icons-2.svg',
        id: 'home-filled-2',
        category: 'uix-icon'
      },
      {
        path: 'icons-2.svg',
        id: 'home-filled-333',
        category: 'ui-icon'
      },
      {
        path: 'icons-3.svg',
        id: 'home-filled-333',
        category: 'ui-icon'
      },
      {
        path: 'icons-3.svg',
        id: 'home-filled-3',
        category: 'uixx-icon'
      },
      {
        path: 'icons-3.svg',
        id: 'home-filled-33',
        category: 'uixx-icon'
      }
    ];
    spritePaths.forEach(p => {
      try {
        const content = fs.readFileSync(`${output}/${p.path}`, 'utf8');
        const doc = new DOMParser().parseFromString(content, 'svg');
        const defs = doc.getElementById(p.category);
        assert.ok(
          defs && defs.tagName === 'defs',
          'has <defs> element with the right ID'
        );
        assert.ok(doc.getElementById(p.id), 'has SVG with right ID');
      } catch (err) {
        assert.ok(false, `${err} with ${p.category}`);
      }
    });
  });

  it('it only puts 5 variants into the sprite', async () => {
    try {
      const content = fs.readFileSync(`${output}/icons.svg`, 'utf8');
      const doc = new DOMParser().parseFromString(content, 'svg');
      const svgs = doc.getElementsByTagName('svg');
      // 2 icons + parent svg
      assert.ok(svgs.length === 6, 'Only five variants in sprite');
      const svgIDs = [
        'ads-default',
        'ads-default-2',
        'point-default',
        'point-default-2',
        'a-home-filled-1'
      ];
      svgIDs.forEach(id => {
        assert.ok(
          doc.getElementById(id),
          'puts the right variants into sprite'
        );
      });
    } catch (err) {
      assert.ok(false, err);
    }
  });

  it('copies svg assets with no sprite config to output', async () => {
    try {
      const iconPath = `${output}/ui-icon/achievement`;
      const files = fs.readdirSync(iconPath);
      assert.ok(files.includes('filled.svg'));
    } catch (err) {
      assert.ok(false, err);
    }
  });

  it('sprites are always arranged alphabetically', async () => {
    await distributeByType(iconSet, output, 'svg', true);
    try {
      const content = fs.readFileSync(`${output}/test-icons.svg`, 'utf8');
      const doc = new DOMParser().parseFromString(content, 'svg');
      const svgs = doc.getElementsByTagName('svg');
      assert.ok(svgs.length === 3, 'Only 2 variants in sprite');
      const svgIDs = [
        'animal-small',
        'animal-large',
      ];
      svgIDs.forEach(id => {
        assert.ok(
          doc.getElementById(id),
          'puts the right variants into sprite'
        );
      });

      assert.equal(
        svgs[1],
        doc.getElementById('animal-large'),
        'should be sorted alphabetically'
      );
    } catch (err) {
      assert.ok(false, err);
    }
  });
});
