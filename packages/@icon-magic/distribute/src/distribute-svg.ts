import { Asset, Icon, IconSet, SpriteConfig } from '@icon-magic/icon-models';
import { Logger } from '@icon-magic/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

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
 * @param colorScheme array of strings matching the colorScheme attributes of the icon i.e: `light`, `dark`, `mixed`.
 * @param doNotRemoveSuffix boolean, when true will keep the "-mixed" and "-with-image" suffixes in file name when distributing to hbs.
 * @returns promise after completion
 */
export async function distributeSvg(
  iconSet: IconSet,
  outputPath: string,
  groupByCategory: boolean,
  outputAsHbs: boolean,
  outputToOneDirectory: boolean,
  colorScheme: string[],
  withEmbeddedImage: boolean,
  doNotRemoveSuffix: boolean = true
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
      LOGGER.debug(`Warning: By default the "-mixed" suffix is trimmed from the file name when distributed to hbs or to one directory. The file name will be the SAME as the light variant. Use the --doNotRemoveSuffix flag to keep the "-mixed" in the file name.`);
    }

    const assets = getIconFlavorsByType(icon, 'svg');
    // Further filter the icons by matching the assets's colorScheme to the
    // commander option --colorScheme

    let lightAssets = assets.filter(asset => asset.colorScheme ? asset.colorScheme === 'light' : true); // Light variants can either have colorScheme: `light`, null, or undefined
    let darkAssets = assets.filter(asset => asset.colorScheme === 'dark');
    let mixedAssets = assets.filter(asset => asset.colorScheme === 'mixed');

    let assetsToDistribute: Asset[] = [];

    colorScheme.forEach(value => {
      switch(value) {
        case 'light': {
          assetsToDistribute = assetsToDistribute.concat(...lightAssets);
          break;
        }
        case 'dark': {
          assetsToDistribute = assetsToDistribute.concat(...darkAssets);
          break;
        }
        case 'mixed': {
          assetsToDistribute = assetsToDistribute.concat(...mixedAssets);
          break;
        }
        case 'default': {
          if (mixedAssets.length) {
            assetsToDistribute = assetsToDistribute.concat(...mixedAssets);
          } else {
            assetsToDistribute = assetsToDistribute.concat(...lightAssets);
            assetsToDistribute = assetsToDistribute.concat(...darkAssets);
          }
          break;
        }
      }
    })

    if (withEmbeddedImage) {
      // filter down to only the assets that contain embedded images in them
      assetsToDistribute = assetsToDistribute.filter(asset => {
        return asset.name.match(/-with-image/) ? true : false;
      });
    } else {
      // return only the assets without the suffix
      assetsToDistribute = assetsToDistribute.filter(asset => {
        return asset.name.match(/-with-image/) ? false : true;
      });
    }

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
        ? partitionAssetsForSprite(assetsToDistribute, variantsToFilter)
        : { assetsToAddToSprite: assetsToDistribute, assetsNoSprite: assetsToDistribute };

    const iconHasSpriteConfig = !(
      distributeConfig &&
      svgConfig &&
      !svgConfig.toSprite
    );

    const destPath =
        icon.category && groupByCategory
          ? path.join(outputPath, icon.category)
          : outputPath;

    if (outputAsHbs) {
      try {
        const imageHrefHelper = svgConfig && svgConfig.outputAsHbs && svgConfig.outputAsHbs.imageHrefHelper;
        const pathToTheImageAsset = svgConfig && svgConfig.outputAsHbs && svgConfig.outputAsHbs.pathToTheImageAsset;
        await createHbs(assetsToDistribute, destPath, imageHrefHelper, pathToTheImageAsset, doNotRemoveSuffix);
      }
      catch(e) {
        LOGGER.debug(`There was an issue creating the hbs file: ${e}`);
      }
    }
    else if (outputToOneDirectory) {
      // this comes before the check for the sprite config and therefore does
      // not respect the value of the config.spriteNames and distributes
      // assets similar to outputAsHbs above
      await copyIconAssetSvgs(icon.iconName, assetsToDistribute, destPath, true, !doNotRemoveSuffix);
    }
    else if (iconHasSpriteConfig) {
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
      await copyIconAssetSvgs(icon.iconName, assetsNoSprite, destPath, false, !doNotRemoveSuffix);
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
  outputPath: string,
  outputToOneDirectory:boolean = false,
  stripSuffix = true
) {
  let outputIconDir = outputToOneDirectory ? outputPath : path.join(outputPath, iconName);

  await fs.mkdirp(outputIconDir);
  // copy all assets to the output icon directory
  const promises = [];
  for (const asset of assets) {
    let assetName = outputToOneDirectory ? `${iconName}-${path.basename(asset.getPath())}` : path.basename(asset.getPath());
    if (stripSuffix) {
      assetName = assetName.replace(/-mixed.svg$/, '.svg');
      assetName = assetName.replace(/-with-image/, '')
    }
    promises.push(
      fs.copy(
        asset.getPath(),
        path.join(outputIconDir, assetName)
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
