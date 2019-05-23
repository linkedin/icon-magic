import { Logger, logger } from '@icon-magic/logger';

import { Icon } from './icon';
import { IconConfigHash, IconSetHash } from './interface';

/**
 * This class encapsulates a set of icons
 *
 * Right now, it's very barebones and only constructs a hash from a config hash
 * but we can extend it in future if the need arises for adding and removing
 * values from the hash
 */
export class IconSet {
  hash: IconSetHash;
  private LOGGER: Logger;

  /**
   * Creates a map of Icons from a map of configs
   * @param iconConfigHash map of the icon to it's underlying config json.
   * @param skipVariantCheck if true, skips the check to verify the existence of
   * variants on each icon in the icon set
   */
  constructor(iconConfigHash?: IconConfigHash, skipVariantCheck?: boolean) {
    this.hash = new Map();
    this.LOGGER = logger('icon-magic:icon-models:icon-set');

    if (iconConfigHash) {
      // iterate through all the entires and add it to the map
      for (const [iconPath, config] of iconConfigHash) {
        let icon;
        try {
          icon = new Icon(config, skipVariantCheck);
        } catch (e) {
          // if there were errors in creating this icon, log the error and
          // continue to the next
          this.LOGGER.error(`${iconPath}: ${e}`);
          continue;
        }
        this.hash.set(iconPath, icon);
      }
    }
  }
}
