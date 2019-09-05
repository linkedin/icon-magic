import { Asset, Icon, IconSet, SpriteConfig } from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

import {
  addToSprite,
  partitionAssetsForSprite,
  writeSpriteToFile
} from './create-sprite';
import { getIconFlavorsByType } from './utils';

const LOGGER: Logger = logger('icon-magic:distribute:distribute-svg');

/**
 *
 * @param iconSet set of icons to be moved to the output folder or added to sprite
 * @param outputPath path to move to
 * @param groupByCategory (for sprite creation) whether to group by the category attribute
 * @returns promise after completion
 */
export async function distributeSvg(
  iconSet: IconSet,
  outputPath: string,
  groupByCategory: boolean
): Promise<void> {
  // Sort icons so it looks pretty in .diff
  const icons = sortIcons(iconSet.hash.values());
  // Keep track of the sprites that have been created so we know when to create
  // a new one and when to append to an existing document
  const spriteNames: SpriteConfig = {};
  const promises: any[] = [];
  for (const icon of icons) {
    LOGGER.debug(`calling distributeSvg on ${icon.iconName}: ${icon.iconPath}`);
    const assets = getIconFlavorsByType(icon, 'svg');
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
        ? partitionAssetsForSprite(assets, variantsToFilter)
        : { assetsToAddToSprite: assets, assetsNoSprite: assets };

    const iconHasSpriteConfig = !(
      distributeConfig &&
      svgConfig &&
      !svgConfig.toSprite
    );

    if (iconHasSpriteConfig) {
      // By default, if there is no distribute config, add to the sprite
      // Default spriteName is `icons`
      LOGGER.debug(`0`);

      const iconSpriteNames =
        svgConfig && svgConfig.spriteNames ? svgConfig.spriteNames : ['icons'];
      iconSpriteNames.forEach(async spriteName => {
        promises.push(
          await addToSprite(
            spriteName,
            assetsToAddToSprite,
            groupByCategory,
            icon.category,
            spriteNames
          )
        );
      });
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
    LOGGER.debug(`5x`);
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
    const iconNameOne = iconOne.iconName;
    const iconNameTwo = iconTwo.iconName;
    if (iconNameOne < iconNameTwo) {
      return -1;
    }
    if (iconNameOne > iconNameTwo) {
      return 1;
    }
    return 0;
  });
}
