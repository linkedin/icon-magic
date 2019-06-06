import { Asset, Icon, IconSet, spriteConfig } from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

import { addToSprite, writeSpriteToFile } from './create-sprite';
import { getIconFlavorsByType } from './utils';

const LOGGER: Logger = logger('icon-magic:distribute/index');

/**
 *
 * @param iconSet set of icons to be moved to the output folder or added to sprite
 * @param outputPath path to move to
 * @param groupByCategory (for sprite creation) whether to group by the category attribute
 * @returns promise after completion
 */
export default async function distributeSvg(
  iconSet: IconSet,
  outputPath: string,
  groupByCategory: boolean
): Promise<void> {
  const icons = sortIcons(iconSet.hash.values());
  const spriteNames: spriteConfig = {};
  for (const icon of icons) {
    LOGGER.debug(`calling distributeSvg on ${icon.iconName}: ${icon.iconPath}`);
    const assets = getIconFlavorsByType(icon, 'svg');
    if (
      icon.distribute &&
      icon.distribute.svg &&
      !icon.distribute.svg.toSprite
    ) {
      await copyIconAssetSvgs(icon.iconName, assets, outputPath);
    } else {
      let spriteName =
        icon.distribute && icon.distribute.svg && icon.distribute.svg.spriteName
          ? icon.distribute.svg.spriteName
          : 'icons';
      await addToSprite(
        spriteName,
        assets,
        groupByCategory,
        icon.category,
        spriteNames
      );
    }
  }
  await writeSpriteToFile(spriteNames, outputPath);
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
