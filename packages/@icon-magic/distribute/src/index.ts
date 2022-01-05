import { IconConfigHash, IconSet } from '@icon-magic/icon-models';
import { Logger } from '@icon-magic/logger';

import { createImageSet } from './create-image-set';
import { distributeByResolution } from './distribute-by-resolution';
import { distributeSvg } from './distribute-svg';

const LOGGER = new Logger('icon-magic:distribute:index');
type ICON_TYPES = 'svg' | 'png' | 'webp' | 'all';

/**
 * Distributes a set of icons to the output folder based on the flag
 * @param iconSet set of icons to be moved to the output folder
 * @param outputPath output directory path to copy the assets to
 * @param type svg, png, webp, all
 * @param groupByCategory (for sprite creation) whether to group by the category attribute
 * @param colorScheme array of strings matching the colorScheme attributes of the icon ie: `light`, `dark`, `mixed`.
 * @param doNotRemoveSuffix boolean, when true will keep the "-mixed" and
 * "-with-image" suffixes in file name when distributing to hbs.
 * @retuns promise after completion
 */
export async function distributeByType(
  iconConfig: IconConfigHash,
  outputPath: string,
  type: ICON_TYPES = 'all',
  groupByCategory = true,
  outputAsHbs = false,
  colorScheme: string[] = ['light', 'dark'],
  withEmbeddedImage = false,
  doNotRemoveSuffix = false,
  outputAsCustomElement = false
): Promise<void> {
  LOGGER.debug(`entering distribute with ${type} and colorSchemes: ${colorScheme}`);
  const iconSet = new IconSet(iconConfig, true);
  switch (type) {
    case 'png': {
      await createImageSet(iconSet, outputPath);
      break;
    }
    case 'webp': {
      await distributeByResolution(iconSet, outputPath);
      break;
    }
    case 'svg': {
      await distributeSvg(iconSet, outputPath, groupByCategory, outputAsHbs, colorScheme, withEmbeddedImage, doNotRemoveSuffix, outputAsCustomElement);
      break;
    }
    default: {
      await createImageSet(iconSet, outputPath);
      await distributeByResolution(iconSet, outputPath);
      await distributeSvg(iconSet, outputPath, groupByCategory, outputAsHbs, colorScheme, withEmbeddedImage, doNotRemoveSuffix, outputAsCustomElement);
    }
  }
}
