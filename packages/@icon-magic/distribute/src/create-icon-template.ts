
import { Asset } from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser, XMLSerializer } from 'xmldom';


const serializeToString = new XMLSerializer().serializeToString;

/**
 * Saves svg assets as handlebars files
 * @param assets SVG assets to convert
 * @param outputPath path to write to
 * @param doNotRemoveSuffix boolean, when true will keep the "-mixed" suffix in file name when distributing to hbs.
 */
export async function createHbs(
  assets: Asset[],
  outputPath: string,
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
    // Remove the "-mixed" suffix from the name. File will have same name as light version.
    if (!doNotRemoveSuffix && asset.colorScheme === 'mixed') {
      iconName = iconName.replace(/-mixed$/, '');
    }

    // add splattributes to the hbs file
    xml.documentElement.setAttribute('...attributes', '');
    await fs.mkdirp(outputPath);

    // xmldom and other dom substitutions (like jsdom) add ...attributes="" and
    // the string replace below is an ugly hack to remove the empty string
    fs.writeFileSync(path.join(outputPath, `${iconName}.hbs`), serializeToString(xml).replace(/...attributes=\"\"/g, '...attributes'));
  }
}

