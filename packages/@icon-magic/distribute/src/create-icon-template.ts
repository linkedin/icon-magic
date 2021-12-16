
import { Asset } from '@icon-magic/icon-models';
import { AST, transform } from 'ember-template-recast';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser, XMLSerializer } from 'xmldom';

const serializeToString = new XMLSerializer().serializeToString;

/**
 * Saves svg assets as handlebars files
 * @param assets SVG assets to convert
 * @param outputPath path to write to
 * @param doNotRemoveSuffix boolean, when true will keep the "-mixed" and
 * "-with-image" suffix in file name when distributing to hbs.
 */
export async function createHbs(
  assets: Asset[],
  outputPath: string,
  imageHrefHelper: string|undefined,
  pathToTheImageAsset: string|undefined,
  doNotRemoveSuffix: boolean
): Promise<void> {
  for (const asset of assets) {
    const doc = new DOMParser();
    // Get contents of the asset, since it's an SVG the content will be in XML format
    // Content Buffer | string
    const contents = await asset.getContents();
    // Parse XML from a string into a DOM Document.
    const xml = doc.parseFromString(contents as string, 'image/svg+xml');
    const el = xml.documentElement;
    const id = el.getAttributeNode('id');
    let iconName = id ? id.value : '';
    // Strip id
    el.removeAttribute('id');

    const template = serializeToString(xml);
    const { code } = transform({
      template,
      plugin(env) {
        const { builders: b } = env.syntax;

        return {
          ElementNode(node) {
            if (node.tag === 'svg' && node.attributes.find(attr => attr.name === 'xmlns')) {
              // add splattributes to the hbs file
              node.attributes.unshift(b.attr('...attributes', b.text('')));

              // aria-hidden should be the only attribute before ...attributes
              const ariaHiddenAttr = node.attributes.find(attr => attr.name === 'aria-hidden');
              const roleAttr = node.attributes.find(attr => attr.name === 'role');
              node.attributes = node.attributes.filter(a => a !== ariaHiddenAttr && a !== roleAttr);

              if (roleAttr) {
                node.attributes.unshift(roleAttr);
              }

              if (ariaHiddenAttr) {
                node.attributes.unshift(ariaHiddenAttr);
              }
            } else if (imageHrefHelper && node.tag === 'image') {
              const imgHrefAttr = node.attributes.find(attr => attr.name === 'href');
              node.attributes = node.attributes.filter(a => a !== imgHrefAttr);

              if (imgHrefAttr) {
                // replace the href to include the helper
                const imageHrefValue = imgHrefAttr.value as AST.TextNode;
                node.attributes.unshift(b.attr('href', b.mustache(b.path("get-asset-url"), [b.string(pathToTheImageAsset ? path.join(pathToTheImageAsset, imageHrefValue.chars) : imageHrefValue.chars)], b.hash([]))));
              }
            }
          }
        };
      }
    });

    // Remove the "-mixed" suffix from the name. File will have same name as light version.
    if (!doNotRemoveSuffix && asset.colorScheme === 'mixed') {
      iconName = iconName.replace(/-mixed$/, '');
      iconName = iconName.replace(/-with-image/, '');
    }

    // create the output directory if it doesn't already exist
    await fs.mkdirp(outputPath);

    // write the new hbs template file to disk
    fs.writeFileSync(path.join(outputPath, `${iconName}.hbs`), code);
  }
}

