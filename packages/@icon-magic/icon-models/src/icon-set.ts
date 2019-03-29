import { IconConfigHash, IconSetHash } from './interface';
import { Icon } from './icon';

/**
 * This class encapsulates a set of icons
 *
 * Right now, it's very barebones and only constructs a hash from a config hash
 * but we can extend it in future if the need arises for adding and removing
 * values from the hash
 */
export class IconSet {
  hash: IconSetHash;

  /**
   * Creates a map of Icons from a map of configs
   * @param iconConfigHash map of the icon to it's underlying config json.
   */
  constructor(iconConfigHash?: IconConfigHash) {
    this.hash = new Map();

    if (iconConfigHash) {
      // iterate through all the entires and add it to the map
      for (let [iconPath, config] of iconConfigHash) {
        this.hash.set(iconPath, new Icon(config));
      }
    }
  }
}
