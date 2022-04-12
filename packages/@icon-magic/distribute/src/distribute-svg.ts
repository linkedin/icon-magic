import { Asset, FlavorType, Icon, IconSet, SpriteConfig } from '@icon-magic/icon-models';
import { Logger } from '@icon-magic/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

import { createCustomElement } from './create-custom-element';
import { createHbs } from './create-icon-template';
import {
  addToSprite,
  partitionAssetsForSprite,
  writeSpriteToFile
} from './create-sprite';
import { compareStrings, getIconFlavorsByType } from './utils';

const LOGGER = new Logger('icon-magic:distribute:distribute-svg');

/**
 *
 * @param iconSet set of icons to be moved to the output folder or added to sprite
 * @param outputPath path to move to
 * @param groupByCategory (for sprite creation) whether to group by the category attribute
 * @param outputAsHbs whether to distribute svg assets as handlebar files
 * @param colorScheme array of strings matching the colorScheme attributes of the icon i.e: `light`, `dark`, `mixed`.
 * @param withEmbeddedImage (for web) whether to filter only those assets with embedded images
 * @param doNotRemoveSuffix boolean, when true will keep the "-mixed" and "-with-image" suffixes in file name when distributing to hbs.
 * @param outputAsCustomElement whether to distribute svg assets as custom element js files
 * @returns promise after completion
 */
export async function distributeSvg(
  iconSet: IconSet,
  outputPath: string,
  groupByCategory: boolean,
  outputAsHbs: boolean,
  colorScheme: string[],
  withEmbeddedImage: boolean,
  doNotRemoveSuffix: boolean,
  outputAsCustomElement: boolean
): Promise<void> {
  // Sort icons so it looks pretty in .diff
  const icons = sortIcons(iconSet.hash.values());
  // Keep track of the sprites that have been created so we know when to create
  // a new one and when to append to an existing document
  const spriteNames: SpriteConfig = {};
  const promises: void[] = [];
  for (const icon of icons) {
    LOGGER.debug(`calling distributeSvg on ${icon.iconName}: ${icon.iconPath} with colorScheme: ${colorScheme}`);
    if (!doNotRemoveSuffix && colorScheme.includes('mixed')){
      LOGGER.warn(`Warning: By default the "-mixed" suffix is trimmed from the file name when distributed to hbs. The file name will be the SAME as the light variant. Use the --doNotRemoveSuffix flag to keep the "-mixed" in the file name.`);
    }

    const svgAssetsToDistribute = getAssetsToDistribute(icon, 'svg', colorScheme, withEmbeddedImage);
    const distributeConfig = icon.distribute;
    const svgConfig = distributeConfig && distributeConfig.svg;
    // variantsToFilter can be defined on distribute or on distribute.svg
    const iconVariantsToFilter =
      distributeConfig && distributeConfig.variantsToFilter;
    const svgVariantsToFilter = svgConfig && svgConfig.variantsToFilter;
    const variantsToFilter = svgVariantsToFilter || iconVariantsToFilter;

    // If icon has defined the assets to go to sprite
    const { assetsToAddToSprite, assetsNoSprite } =
      variantsToFilter && variantsToFilter.length
        ? partitionAssetsForSprite(svgAssetsToDistribute, variantsToFilter)
        : { assetsToAddToSprite: svgAssetsToDistribute, assetsNoSprite: svgAssetsToDistribute };

    const iconHasSpriteConfig = !(
      distributeConfig &&
      svgConfig &&
      !svgConfig.toSprite
    );

    if (outputAsHbs || outputAsCustomElement) {
      const destPath =
        icon.category && groupByCategory
          ? path.join(outputPath, icon.category)
          : outputPath;
      if (outputAsHbs) {
        try {
          const imageHrefHelper = svgConfig && svgConfig.outputAsHbs && svgConfig.outputAsHbs.imageHrefHelper;
          const pathToTheImageAsset = svgConfig && svgConfig.outputAsHbs && svgConfig.outputAsHbs.pathToTheImageAsset;
          await createHbs(svgAssetsToDistribute, destPath, imageHrefHelper, pathToTheImageAsset, doNotRemoveSuffix);
        }
        catch(e) {
          LOGGER.debug(`There was an issue creating the hbs file: ${e}`);
        }
      }
      if (outputAsCustomElement) {
        try {
          const customElementAssetsToDistribute = getAssetsToDistribute(icon, 'customElement', colorScheme, withEmbeddedImage);
          await createCustomElement(customElementAssetsToDistribute, destPath, icon, doNotRemoveSuffix);
        }
        catch(e) {
          LOGGER.debug(`There was an issue creating the custom element js file: ${e}`);
        }
      }
    } else if (iconHasSpriteConfig) {
      // By default, if there is no distribute config, add to the sprite
      // Default spriteName is `icons`
      const iconSpriteNames =
        svgConfig && svgConfig.spriteNames ? svgConfig.spriteNames : ['icons'];
      for (const spriteName of iconSpriteNames) {
        promises.push(
          await addToSprite(
            spriteName,
            assetsToAddToSprite,
            groupByCategory,
            icon.category,
            spriteNames
          )
        );
      }
    } else {
      // Just copy the files to the output
      // If the groupByCategory flag is available,
      // put them in a folder that matches the icon category
      const destPath =
        icon.category && groupByCategory
          ? path.join(outputPath, icon.category)
          : outputPath;
      await copyIconAssetSvgs(icon.iconName, assetsNoSprite, destPath);
    }
  }

  await Promise.all(promises).then(async () => {
    // After we've gone through all the icons, write the sprites to a file
    await writeSpriteToFile(spriteNames, outputPath);
  });
}

/**
 * Moves the svg assets of an icon to the outputPath
 * @param iconName name of icon whose assets should be moved
 * @param assets to be moved
 * @param outputPath path to move to
 */
async function copyIconAssetSvgs(
  iconName: string,
  assets: Asset[],
  outputPath: string
) {
  const outputIconDir = path.join(outputPath, iconName);
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
 * Sorts a set of icons by property iconName
 * @param icons set of icons to sort
 * @returns sorted array of icons
 */
function sortIcons(icons: IterableIterator<Icon>): Array<Icon> {
  return Array.from(icons).sort((iconOne: Icon, iconTwo: Icon) => {
    return compareStrings(iconOne.iconName, iconTwo.iconName);
  });
}

/**
 * Get the list of assets that needs to be distributed.
 * @param icon to be moved to the output folder or added to sprite
 * @param type to which to filter the icon's flavors by
 * @param colorScheme array of strings matching the colorScheme attributes of the icon i.e: `light`, `dark`, `mixed`
 * @param withEmbeddedImage true if icon is embedded with image
 * @returns list of assets to be distributed
 */
function getAssetsToDistribute(icon: Icon, type: FlavorType, colorScheme: string[], withEmbeddedImage: boolean) {
  const assets = getIconFlavorsByType(icon, type);
  // Further filter the icons by matching the assets's colorScheme to the commander option --colorScheme
  let assetsToDistribute = assets.filter(asset => {
    if (asset.colorScheme) {
      return colorScheme.includes(asset.colorScheme);
    }
    // Light variants can either have colorScheme: `light`, null, or undefined
    return colorScheme.includes('light');
  });
  if (withEmbeddedImage) {
    // filter down to only the assets that contain embedded images in them
    assetsToDistribute = assetsToDistribute.filter(asset => {
      return asset.name.match(/-with-image/) ? true : false;
    });
  } else {
    assetsToDistribute = assetsToDistribute.filter(asset => {
      return asset.name.match(/-with-image/) ? true : false;
    });
  }
  return assetsToDistribute;
}
