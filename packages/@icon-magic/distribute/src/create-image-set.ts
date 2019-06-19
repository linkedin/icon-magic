import { Asset, IconSet } from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

import { getAssetResolutionFromName, getIconFlavorsByType } from './utils';

const LOGGER: Logger = logger('icon-magic:distribute:create-image-set');
const IOS_SUPPORTED_RESOLUTIONS = [1, 2, 3];

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
export async function createImageSet(iconSet: IconSet, outputPath: string) {
  for (const icon of iconSet.hash.values()) {
    LOGGER.debug(`Creating imageSet for ${icon.iconName}`);
    const assets = getIconFlavorsByType(icon, 'png');
    const promises = [];
    const ASSET_CATALOG = 'Contents.json'; // as defined for iOS
    let iconOutputPath = outputPath;

    // prepend the outputPath with the category so output icons are categorized
    // by category name
    if (icon.category) {
      iconOutputPath = path.join(iconOutputPath, icon.category);
    }

    for (const asset of assets) {
      // if the asset is not a supported ios resolution, then do nothing
      if (!isSupportedResolution(asset)) {
        continue;
      }

      let assetNameForCatalog = `${icon.iconName}_${path.basename(
        asset.getPath()
      )}`.replace(/-/g, '_');

      // if the category is present, prepend it to the name
      if (icon.category) {
        assetNameForCatalog = `${icon.category}_${assetNameForCatalog}`;
      }

      // strip the resolution from the asset name to get the name of the imageset
      const outputIconDir = path.join(
        iconOutputPath,
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
    await Promise.all(promises);
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

/**
 * Checks if the asset is among the supported resolutions by looking at the name
 * of the asset
 * @param asset the asset to check if it's in a supported resolution
 */
function isSupportedResolution(asset: Asset) {
  const assetResolution = Number(asset.name.split('@').pop());
  return assetResolution
    ? IOS_SUPPORTED_RESOLUTIONS.includes(Number(assetResolution))
    : true;
}
