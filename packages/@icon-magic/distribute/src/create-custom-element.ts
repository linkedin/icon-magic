import { Asset, Icon } from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Saves custom element assets as js files
 * @param assets custom element assets to be saved
 * @param outputPath path to write to
 * @param icon icon from which custom element assets are derived
 * @param doNotRemoveSuffix boolean, when true will keep the "-mixed" and
 *        "-with-image" suffix in file name
 */
export async function createCustomElement(
  assets: Asset[],
  outputPath: string,
  icon: Icon,
  doNotRemoveSuffix: boolean
): Promise<void> {
  for (const asset of assets) {
    const prefix = icon?.generatedMetadata?.customElement?.namePrefix || '';
    // file name must match the custom element name
    let fileName = `${prefix}${icon.iconName}-${asset.name}`;
    let fileContents = (await asset.getContents()) as string;

    // Remove the "-mixed" suffix from the name. File will have same name as light version.
    if (!doNotRemoveSuffix && asset.colorScheme === 'mixed') {
      fileName = fileName.replace(/-mixed$/, '');
      fileName = fileName.replace(/-with-image/, '');
    }

    // create the output directory if it doesn't already exist
    await fs.mkdirp(outputPath);

    // write the new custom element js file to disk
    fs.writeFileSync(path.join(outputPath, `${fileName}.js`), fileContents);
  }
}

