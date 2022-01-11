import * as configReader from '@icon-magic/config-reader';
import * as assert from 'assert';
import * as recast  from 'ember-template-recast';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser } from 'xmldom';

import { distributeByType } from '../src';

const FIXTURES = path.resolve(__dirname, '..', '..', 'test', 'fixtures');
const input = path.resolve(FIXTURES, 'input');
const output = path.resolve(FIXTURES, 'out');
const iconSet = configReader.getIconConfigSet(new Array(input));

describe('distribute works as expected', function () {
  it('Moves all -with-image.svg files to the right output directory', async () => {
    const iconSetAnimal = configReader.getIconConfigSet(new Array(path.resolve(FIXTURES, 'input/animal-with-embedded-images')));
    await distributeByType(iconSetAnimal, output, 'svg', true, false, ['light', 'dark'], true);
    try {
      const files = fs.readdirSync(`${output}/its-ui-with-embedded-images/animal`);
      assert.ok(files.includes('small.svg'));
      assert.ok(files.includes('large.svg'));
    } catch (err) {
      assert.ok(false, err);
    }
  });

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
        iconName: 'ic_ui_icon_filled_1_filled_24x12'
      },
      {
        iconName: 'ic_uix_icon_filled_2_filled_24x12'
      },
      {
        iconName: 'ic_uixx_icon_filled_3_filled_24x12'
      },
      {
        iconName: 'ic_ui_icon_filled_1_filled_60x60'
      },
      {
        iconName: 'ic_ui_icon_filled_4_filled_24x12'
      },
      {
        iconName: 'ic_ui_icon_filled_4_filled_60x60'
      },
      {
        iconName: 'ic_ui_icon_2_filled_6_filled_24x12'
      },
      {
        iconName: 'ic_ui_icon_2_filled_6_filled_60x60'
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

  it('distributes rtl and regular-ltr .webp files to the right output directories', async () => {
    await distributeByType(iconSet, output, 'webp', false);
    const iconPath = `${output}/drawable-xxxhdpi`;
    const flipIconPath = `${output}/drawable-ldrtl-xxxhdpi`;
    const iconName = 'ic_ui_icon_arrow_left_medium_24x12';

    const file = fs.readdirSync(iconPath);
    const flipFile = fs.readdirSync(flipIconPath);

    assert.ok(
      file.includes(`${iconName}.webp`),
      `includes regular-ltr ${iconName}.webp`
    );

    assert.ok(
      flipFile.includes(`${iconName}.webp`),
      `includes rtl ${iconName}.webp`
    );
  });

  it('Moves all .png files to the output directory', async () => {
    const LTR = "left-to-right";
    const RTL = "right-to-left";
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
      },
      {
        iconName: 'arrow_left_medium_24x12',
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

          const contentsJsonImages = fs.readJsonSync(path.join(iconPath, 'Contents.json')).images;
          assert.ok(Array.isArray(contentsJsonImages), 'Contents.json is filled with an array called images');
          assert.ok(contentsJsonImages.find((entry: { filename: string; }) => entry.filename === `${icon.category}_${icon.iconName}@2.png`));

          const arrowRtlImages = contentsJsonImages.filter((entry) => entry.filename === `ui-icon_arrow_left_medium_24x12@2_rtl`);
          const arrowLtrImages = contentsJsonImages.filter((entry) => entry.filename === `ui-icon_arrow_left_medium_24x12@2`);

          // If array with RTL arrow image exists
          if (arrowRtlImages.length > 1) {
            assert.ok(arrowRtlImages.find((entry) => {
              // language-direction property is set correctly to rtl
              return entry["language-direction"] === RTL;
            }));
          }

          // If array with LTR arrow image exists
          if (arrowLtrImages.length > 1) {
            assert.ok(arrowLtrImages.find((entry) => {
              // language-direction property is set correctly to ltr
              return entry["language-direction"] === LTR;
            }));
          }

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

  it('Moves all dark .png files to the output directory as expected', async () => {
    const input = path.resolve(FIXTURES, 'input/company');
    const output = path.resolve(FIXTURES, 'out');
    const iconSet = configReader.getIconConfigSet(new Array(input));

    await distributeByType(iconSet, output, 'png', false);
    try {
      const iconPath = `${output}/entity-backgrounds/entity-backgrounds_company_default_2048x512.imageset`;
      if (fs.existsSync(iconPath)) {
        assert.ok(`${iconPath} dir was generated`);
        const files = fs.readdirSync(iconPath);
        assert.ok(
          files.indexOf('Contents.json') > -1,
          'Contents.json was generated'
        );

        const contentsJsonImages = fs.readJsonSync(path.join(iconPath, 'Contents.json')).images;
        assert.ok(Array.isArray(contentsJsonImages), 'Contents.json is filled with an array called images');
        const darkImage = contentsJsonImages.find((entry: { filename: string; }) =>
          entry.filename === `entity-backgrounds_company_default_on_dark_2048x512@2.png`
        );

        assert.ok(typeof darkImage === 'object', 'Dark icons in contents.json');
        assert.ok(darkImage.appearances.length > 0, 'Has appearances array');

        assert.ok(contentsJsonImages.find((entry: { filename: string; }) => entry.filename === `entity-backgrounds_company_default_2048x512@2.png`));

        assert.ok(
          files.indexOf(`entity-backgrounds_company_default_2048x512@2.png`) > -1,
          `entity-backgrounds_company_default_2048x512@2.png was created`
        );
        assert.ok(
          files.indexOf(`entity-backgrounds_company_default_on_dark_2048x512@2.png`) > -1,
          `entity-backgrounds_company_default_on_dark_2048x512@2.png was created`
        );
      } else {
        assert.ok(false, `Missing files for ${iconPath}`);
      }
    } catch (err) {
      assert.ok(false, err);
    }
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
        path: 'icons',
        id: 'a-home-filled-1',
        category: 'ui-icon'
      },
      {
        path: 'icons',
        id: 'point-default',
        category: 'app'
      },
      {
        path: 'icons',
        id: 'point-default-2',
        category: 'app'
      },
      {
        path: 'icons',
        id: 'ads-default',
        category: 'app'
      },
      {
        path: 'icons',
        id: 'ads-default-2',
        category: 'app'
      },
      {
        path: 'icons-2',
        id: 'b-home-filled-4',
        category: 'ui-icon'
      },
      {
        path: 'icons-1',
        id: 'c-home-filled-8',
        category: 'ui-icon-2'
      },
      {
        path: 'icons-1',
        id: 'c-home-filled-88-9',
        category: 'ui-icon-3'
      },
      {
        path: 'icons-1',
        id: 'c-home-filled-889',
        category: 'ui-icon-2'
      },
      {
        path: 'icons-2',
        id: 'home-filled-2',
        category: 'uix-icon'
      },
      {
        path: 'icons-2',
        id: 'home-filled-333',
        category: 'ui-icon'
      },
      {
        path: 'icons-3',
        id: 'home-filled-333',
        category: 'ui-icon'
      },
      {
        path: 'icons-3',
        id: 'home-filled-3',
        category: 'uixx-icon'
      },
      {
        path: 'icons-3',
        id: 'home-filled-33',
        category: 'uixx-icon'
      }
    ];
    spritePaths.forEach(p => {
      try {
        const content = fs.readFileSync(`${output}/${p.path}.svg`, 'utf8');
        const doc = new DOMParser().parseFromString(content, 'svg');
        const docIdNode = doc.documentElement.getAttributeNode('id');
        assert.ok(docIdNode && docIdNode.value === p.path, 'svg has ID');

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

  it('creates hbs files', async () => {
    const iconSetAnimal = configReader.getIconConfigSet(new Array(path.resolve(FIXTURES, 'input/animal')));
    await distributeByType(iconSetAnimal, output, 'svg', false, true);
    try {
      const files = fs.readdirSync(output);
      assert.ok(files.includes('animal-small.hbs'));
      assert.ok(files.includes('animal-large.hbs'));
    } catch (err) {
      assert.ok(false, err);
    }
  });

  it('creates hbs files and distributes by category', async () => {
    const iconSetAnimal = configReader.getIconConfigSet(new Array(path.resolve(FIXTURES, 'input/animal')));
    await distributeByType(iconSetAnimal, output, 'svg', true, true);
    try {
      const files = fs.readdirSync(`${output}/its-ui`);
      assert.ok(files.includes('animal-small.hbs'));
      assert.ok(files.includes('animal-large.hbs'));
    } catch (err) {
      assert.ok(false, err);
    }
  });

  it('...attributes comes before certain attributes in hbs files', async () => {
    try {
      const files = fs.readdirSync(`${output}/its-ui`);
      assert.ok(files.includes('animal-small.hbs'));
      assert.ok(files.includes('animal-large.hbs'));

      const content = fs.readFileSync(`${output}/animal-small.hbs`, 'utf8');
      const ast = recast.parse(content);

      if (ast.body[0].type === 'ElementNode') {
        const attrs = ast.body[0].attributes;
        const firstAttr = attrs[0];
        const secondAttr = attrs[1];
        const thirdAttr = attrs[2];

        assert.ok(firstAttr.name === 'aria-hidden');
        assert.ok(secondAttr.name === 'role');
        assert.ok(thirdAttr.name === '...attributes');
      }

    } catch (err) {
      assert.ok(false, err);
    }
  });


  it('it trims "-mixed" from end of hbs file name', async () => {
    const iconSetWordmark = configReader.getIconConfigSet(new Array(path.resolve(FIXTURES, 'input/wordmark')));
    await distributeByType(iconSetWordmark, `${output}/wordmark`, 'svg', false, true, ['mixed'], false);
    try {
      const files = fs.readdirSync(`${output}/wordmark`);
      assert.ok(files.includes('wordmark-large.hbs'));
      assert.ok(files.includes('wordmark-medium.hbs'));
    } catch (err) {
      assert.ok(false, err);
    }
  });

  it('it does not trim "-mixed" from end of hbs file name', async () => {
    const iconSetWordmark = configReader.getIconConfigSet(new Array(path.resolve(FIXTURES, 'input/wordmark')));
    await distributeByType(iconSetWordmark, `${output}/wordmark/untrimmed`, 'svg', false, true, ['mixed'], true);
    try {
      const files = fs.readdirSync(`${output}/wordmark/untrimmed`);
      assert.ok(files.includes('wordmark-large-mixed.hbs'));
      assert.ok(files.includes('wordmark-medium-mixed.hbs'));
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

  it('creates custom element files', async () => {
    const iconSetAnimal = configReader.getIconConfigSet(new Array(path.resolve(FIXTURES, 'input/animal')));
    await distributeByType(iconSetAnimal, output, 'svg', false, true, ['light'], false, false, true);
    try {
      const files = fs.readdirSync(output);
      assert.ok(files.includes('test-prefix-animal-small.js'));
      assert.ok(files.includes('test-prefix-animal-large.js'));
      // const content = fs.readFileSync(`${output}/test-prefix-animal-small.js`, 'utf8');
    } catch (err) {
      assert.ok(false, err);
    }
  });

  it('it trims "-mixed" from end of custom element js file name', async () => {
    const iconSetWordmark = configReader.getIconConfigSet(new Array(path.resolve(FIXTURES, 'input/wordmark')));
    await distributeByType(iconSetWordmark, `${output}/wordmark`, 'svg', false, true, ['mixed'], false, false, true);
    try {
      const files = fs.readdirSync(`${output}/wordmark`);
      assert.ok(files.includes('test-prefix-wordmark-large.js'));
      assert.ok(files.includes('test-prefix-wordmark-medium.js'));

      const content = fs.readFileSync(`${output}/wordmark/test-prefix-wordmark-large.js`, 'utf8');
      assert.strictEqual(/test-prefix-wordmark-large-mixed/.test(content), false);
      assert.strictEqual(/testPrefixWordmarkLargeMixed/.test(content), false);
    } catch (err) {
      assert.ok(false, err);
    }
  });

  it('it does not trim "-mixed" from end of custom element js file name', async () => {
    const iconSetWordmark = configReader.getIconConfigSet(new Array(path.resolve(FIXTURES, 'input/wordmark')));
    await distributeByType(iconSetWordmark, `${output}/wordmark/untrimmed`, 'svg', false, true, ['mixed'], false, true, true);
    try {
      const files = fs.readdirSync(`${output}/wordmark/untrimmed`);
      assert.ok(files.includes('test-prefix-wordmark-large-mixed.js'));
      assert.ok(files.includes('test-prefix-wordmark-medium-mixed.js'));

      const content = fs.readFileSync(`${output}/wordmark/untrimmed/test-prefix-wordmark-large-mixed.js`, 'utf8');
      assert.strictEqual(/test-prefix-wordmark-large-mixed/.test(content), true);
      assert.strictEqual(/testPrefixWordmarkLargeMixed/.test(content), true);
    } catch (err) {
      assert.ok(false, err);
    }
  });
});
