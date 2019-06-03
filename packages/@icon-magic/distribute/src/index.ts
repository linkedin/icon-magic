import { Logger, logger } from '@icon-magic/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

import {
  Asset,
  FlavorType,
  Icon,
  IconConfigHash,
  IconSet
} from '@icon-magic/icon-models';

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
 * Distributes a set of icons to the output folder based on the flag
 * @param iconSet set of icons to be moved to the output folder
 * @param flag createImageSet, distributeByResolution
 * @param outputPath output directory path to copy the assets to
 * @retuns promise after completion
 */
export async function distributeByFlag(
  iconConfig: IconConfigHash,
  outputPath: string,
  flag?: string
): Promise<void> {
  LOGGER.debug(`entering distribute with ${flag}`);
  const iconSet = new IconSet(iconConfig, true);

  for (const icon of iconSet.hash.values()) {
    switch (flag) {
      case 'createImageSet': {
        await createImageSet(icon, outputPath);
      }
      case 'distributeByResolution': {
        await distributeByResolution(icon, outputPath);
      }
      default: {
        await distributeSvg(icon, outputPath);
      }
    }
  }
}

/**
 * Creates an imageSet which is needed for iOS
 * This consists of the assets in different resolutions and a corresponding
 * Content.json file
 * @param icon the icon for which the imageSet needs to be created
 * @param outputPath output directory path to copy the assets to
 * @retuns promise after completion
 */
async function createImageSet(icon: Icon, outputPath: string): Promise<void[]> {
  LOGGER.debug(`Creating imageSet for ${icon.iconName}`);
  const assets = getIconFlavorsByType(icon, 'png');
  const promises = [];
  const ASSET_CATALOG = 'Contents.json'; // as defined for iOS
  for (const asset of assets) {
    const assetNameForCatalog = `${icon.iconName}_${path.basename(
      asset.getPath()
    )}`;

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
  return Promise.all(promises);
}

/**
 * Distributes icons into different folders based on the resolution
 * This is needed for Android
 * @param icon the icon to distribute
 * @param outputPath output directory where the different folders are created
 * for each resolution
 * @retuns promise after completion
 */
async function distributeByResolution(icon: Icon, outputPath: string) {
  LOGGER.debug(`distributeByResolution for ${icon.iconName}`);
  const assets = getIconFlavorsByType(icon, 'webp');
  let outputIconDir;
  // copy all assets to the output icon directory
  const promises = [];
  for (const asset of assets) {
    // the output folder is the folder by resolution
    outputIconDir = path.join(outputPath, getAssetResolutionFromName(asset));
    await fs.mkdirp(outputIconDir);

    // append the icon name to the asset since all icons go into a single
    // directory
    // TODO: have icons have a category field in their config and prepend the
    // category to the asset name. Eg: nav_iconName_assetName
    promises.push(
      fs.copy(
        asset.getPath(),

        path.join(
          outputIconDir,
          `${icon.iconName}_${path.basename(asset.getPath())}`
        )
      )
    );
  }
  return Promise.all(promises);
}

/**
 * Moves the svg assets of an icon to the outputPath
 * @param icon icon to distribute
 * @param outputPath path to move to
 * @retuns promise after completion
 */
async function distributeSvg(icon: Icon, outputPath: string): Promise<void[]> {
  LOGGER.debug(`distributeSvg for ${icon.iconName}`);
  const assets = getIconFlavorsByType(icon, 'svg');
  const outputIconDir = path.join(outputPath, icon.iconName);
  await fs.mkdirp(outputIconDir);
  // copy all assets to the output icon directory
  const promises = [];
  for (const asset of assets) {
    promises.push(
      fs.copy(
        asset.getPath(),
        path.join(outputIconDir, path.basename(asset.getPath()))
      )
    );
  }
  return Promise.all(promises);
}

/**
 * Every icon has a set of flavors and each flavor can have one or more types.
 * This function returns those flavors that contain a certain type
 * @param icon Icon whose flavors are to be returned
 * @param type The type to which to filter the icon's flavors by
 * @returns a list of flavors that contain assets of "type"
 */
function getIconFlavorsByType(icon: Icon, type: FlavorType): Asset[] {
  return Array.from(icon.flavors.values())
    .filter(flavor => {
      return flavor.types.has(type);
    })
    .map(flavor => flavor.types.get(type) as Asset); // type casting here as we have checked for whether the flavor has the type above
}

/**
 * The resolution of an asset is within the assets name as "@resolution"
 * This function matches the name against different resolutions and returns the
 * appropriate scale or resolution
 * @param asset the asset whose resolution needs to be determined
 * @param getAsScale Boolean for returning the scale instead of the resolution
 * @returns either the resolution or scale depending on the boolean getAsScale
 */
function getAssetResolutionFromName(
  asset: Asset,
  getAsScale?: Boolean
): string {
  let resolution;
  let scale;
  switch (true) {
    case /@1.5/.test(asset.name): {
      resolution = 'drawable-mdpi';
      scale = '1.5x';
      break;
    }
    case /@1/.test(asset.name): {
      resolution = 'drawable-hdpi';
      scale = '1x';
      break;
    }
    case /@2/.test(asset.name): {
      resolution = 'drawable-xhdpi';
      scale = '2x';
      break;
    }
    case /@3/.test(asset.name): {
      resolution = 'drawable-xxhdpi';
      scale = '3x';
      break;
    }
    default: {
      resolution = 'drawable-xxxhdpi';
      scale = '4x';
      break;
    }
  }
  return getAsScale ? scale : resolution;
}

/**
 * Loads a JSON from a file
 * @param filePath The filename to load
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
async function writeJSONfile(filePath: string, data: object) {
  return fs.writeFile(`${path.join(filePath)}`, JSON.stringify(data, null, 2));
}
