
import { Asset } from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser } from 'xmldom';

export async function createHbs(
  assets: Asset[],
  outputPath: string,
): Promise<void> {
  for (const asset of assets) {
    const doc = new DOMParser();
    // Get contents of the asset, since it's an SVG the content will be in XML format
    // Content Buffer | string
    const contents = await asset.getContents();
    // Parse XML from a string into a DOM Document.
    const xml = doc.parseFromString(contents as string, 'image/svg+xml');
    const id = xml.documentElement.getAttributeNode('id');
    const iconName = id ? id.value : '';
    fs.writeFile(path.join(outputPath, `${iconName}.hbs`), xml, (err) => {
      if (err) throw err;
      console.log("The file was succesfully saved!");
    });
  }
}

