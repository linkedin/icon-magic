import { Logger, logger } from '@icon-magic/logger';
import { IconSet } from '@icon-magic/icon-models';
import { getAssetResolutionFromName, getIconFlavorsByType } from './utils';
import * as path from 'path';
import * as fs from 'fs-extra';

const LOGGER: Logger = logger('icon-magic:distribute/index');

interface ContentImage {
  idiom: string;
  scale: string;
  filename: string;
}

// TODO: populate this interface as needed
// from https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/ImageSetType.html
interface AssetCatalog {
  images?: ContentImage[];
}

/**
 * Creates an imageSet which is needed for iOS
 * This consists of the assets in different resolutions and a corresponding
 * Content.json file
 * @param icon the icon for which the imageSet needs to be created
 * @param outputPath output directory path to copy the assets to
 */
export default async function createImageSet(iconSet: IconSet, outputPath: string) {
  for (const icon of iconSet.hash.values()) {
    LOGGER.debug(`Creating imageSet for ${icon.iconName}`);
    const assets = getIconFlavorsByType(icon, 'png');
    const promises = [];
    const ASSET_CATALOG = 'Contents.json'; // as defined for iOS
    for (const asset of assets) {
      let assetNameForCatalog = `${icon.iconName}_${path.basename(
        asset.getPath()
      )}`;

      // if the category is present, prepend it to the name
      if (icon.category) {
        assetNameForCatalog = `${icon.category}_${assetNameForCatalog}`;
      }

      // strip the resolution from the asset name to get the name of the imageset
      const outputIconDir = path.join(
        outputPath,
        `${assetNameForCatalog.split('@')[0]}.imageset`
      );

      await fs.mkdirp(outputIconDir);

      const assetCatalogPath = path.join(outputIconDir, ASSET_CATALOG);
      let images: ContentImage[];
      if (fs.existsSync(assetCatalogPath)) {
        const assetCatalogContents: AssetCatalog = await loadJSONFile(
          assetCatalogPath
        );
        images = assetCatalogContents.images || [];
      } else {
        images = [];
      }

      promises.push(
        fs.copy(asset.getPath(), path.join(outputIconDir, assetNameForCatalog))
      );

      // update the assetCatalog if it doesn't contain the asset already
      const doesImageExist = images.find(
        img => img.filename === assetNameForCatalog
      );
      if (!doesImageExist) {
        images.push({
          idiom: 'universal',
          scale: getAssetResolutionFromName(asset, true),
          filename: assetNameForCatalog
        });
        await writeJSONfile(assetCatalogPath, { images });
      }
    }
    Promise.all(promises);
  }
}

/**
 * Loads a JSON from a file.
 * @param filePath The filename to load.
 * @returns The JSON contents as an object
 */
async function loadJSONFile(filePath: string): Promise<object> {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

/**
 * Writes JSON to file
 * @param filePath The filePath to write to
 * @returns Promise to the writeFile operation
 */
async function writeJSONfile(filePath: string, data: object): Promise<void> {
  return fs.writeFile(`${path.join(filePath)}`, JSON.stringify(data, null, 2));
}
