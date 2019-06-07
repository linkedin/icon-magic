import * as configReader from '@icon-magic/config-reader';
import { saveContentToFile } from '@icon-magic/icon-models';
import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser } from 'xmldom';

import { distributeByType } from '../src';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
const input = path.resolve(FIXTURES, 'input');
const output = path.resolve(FIXTURES, 'out');
const iconSet = configReader.getIconConfigSet(new Array(input));

function squashIcons(
  icons: HTMLCollectionOf<SVGSVGElement>,
  strToFind: string | null
): Array<Object> {
  let svgs = [].slice.call(icons);
  if (strToFind) {
    svgs = svgs.filter((icon: Element) => {
      const id = icon.getAttributeNode('id');
      return id && id.value && id.value.includes(strToFind);
    });
  }
  return svgs.map((icon: Element) => {
    const id = icon.getAttributeNode('id');
    const parent = icon.parentNode;
    const parentId = parent ? parent.getAttributeNode('id') : '';
    const iconObj = {
      iconName: id && id.value ? id.value : '',
      iconCategory: parentId ? parentId.value : ''
    };
    const children = [].slice.call(icon.childNodes);
    const childrenIDs = children
      .map((childIcon: Element) => {
        if (childIcon && childIcon.attributes) {
          const childId = childIcon.attributes.getNamedItem('id');
          return childId ? childId.value : '';
        }
        return '';
      })
      .filter((childIcon: Element) => {
        return !!childIcon;
      });
    if (childrenIDs.length) iconObj['childrenIDs'] = childrenIDs;

    return iconObj;
  });
}

describe('distribute works as expected', function() {
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
        iconName: 'ui-icon_filled-1_filled-24x12@2'
      },
      {
        iconName: 'uix-icon_filled-2_filled-24x12@2'
      },
      {
        iconName: 'uixx-icon_filled-3_filled-24x12@2'
      },
      {
        iconName: 'ui-icon_filled-1_filled-60x60@2'
      },
      {
        iconName: 'ui-icon_filled-4_filled-24x12@2'
      },
      {
        iconName: 'ui-icon_filled-4_filled-60x60@2'
      },
      {
        iconName: 'ui-icon-2_filled-6_filled-24x12@2'
      },
      {
        iconName: 'ui-icon-2_filled-6_filled-60x60@2'
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
        iconName: 'ui-icon_filled-1_filled-24x12'
      },
      {
        iconName: 'uix-icon_filled-2_filled-24x12'
      },
      {
        iconName: 'uixx-icon_filled-3_filled-24x12'
      },
      {
        iconName: 'ui-icon_filled-1_filled-60x60'
      }
    ];
    await distributeByType(iconSet, output, 'png', false);
    icons.forEach(icon => {
      try {
        const iconPath = `${output}/${icon.iconName}.imageset`;
        if (fs.existsSync(iconPath)) {
          assert.ok(`${iconPath} dir was generated`);
          const files = fs.readdirSync(iconPath);
          assert.ok(
            files.indexOf('Contents.json') > -1,
            'Contents.json was generated'
          );
          assert.ok(
            files.indexOf(`${icon.iconName}@2.png`) > -1,
            `${icon.iconName}@2.png was created`
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
        path: 'icons-1.svg',
        id: 'a-home-filled-1',
        category: 'ui-icon'
      },
      {
        path: 'icons-1.svg',
        id: 'b-home-filled-4',
        category: 'ui-icon'
      },
      {
        path: 'icons-1.svg',
        id: 'c-home-filled-8',
        category: 'ui-icon-2'
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

  it('creates set of all svgs in old and new sprite files', async () => {
    try {
      const oldIconsFileName = `old-icons`;
      const newIconsFileName = `new-icons`;
      const oldSvgContent = fs.readFileSync(
        `${FIXTURES}/${oldIconsFileName}.svg`,
        'utf8'
      );
      const newSvgContent = fs.readFileSync(
        `${FIXTURES}/${newIconsFileName}.svg`,
        'utf8'
      );
      const oldSvg = new DOMParser().parseFromString(oldSvgContent, 'svg');
      const newSvg = new DOMParser().parseFromString(newSvgContent, 'svg');
      const oldIcons = JSON.stringify(
        squashIcons(oldSvg.documentElement.getElementsByTagName('svg'), '-icon')
      );
      const newIcons = JSON.stringify(
        squashIcons(newSvg.documentElement.getElementsByTagName('svg'), '')
      );
      await saveContentToFile(FIXTURES, oldIconsFileName, oldIcons, 'json');
      await saveContentToFile(FIXTURES, newIconsFileName, newIcons, 'json');
      fs.readFileSync(`${FIXTURES}/${oldIconsFileName}.json`, 'utf8');
      fs.readFileSync(`${FIXTURES}/${newIconsFileName}.json`, 'utf8');
    } catch (err) {
      assert.ok(false, `Could not read file: ${err}`);
    }
  });
});
