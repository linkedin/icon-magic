
import { Asset } from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Saves svg assets as custom element js files
 * @param assets SVG assets to convert
 * @param outputPath path to write to
 * @param doNotRemoveSuffix boolean, when true will keep the "-mixed" and
 * "-with-image" suffix in file name when distributing to hbs.
 */
export async function createCustomElement(
  assets: Asset[],
  outputPath: string,
  doNotRemoveSuffix: boolean
): Promise<void> {
  for (const asset of assets) {
    const contents = (await asset.getContents()) as string;
    const regex = /window\s*\.customElements\s*\.define\s*\(\s*['"]([^'"]*?)\s*['"]/;
    const matchFound = contents.toString().match(regex);
    let iconName = matchFound && matchFound[1] || '';

    // Remove the "-mixed" suffix from the name. File will have same name as light version.
    if (!doNotRemoveSuffix && asset.colorScheme === 'mixed') {
      iconName = iconName.replace(/-mixed$/, '');
      iconName = iconName.replace(/-with-image/, '');
    }

    // create the output directory if it doesn't already exist
    await fs.mkdirp(outputPath);

    // write the new custom element js file to disk
    fs.writeFileSync(path.join(outputPath, `${iconName}.js`), contents);
  }
}

