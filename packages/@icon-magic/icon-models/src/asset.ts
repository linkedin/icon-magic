import { Logger, logger } from '@icon-magic/logger';
import * as path from 'path';

import { AssetConfig, Content, DistributeConfig } from './interface';
import { getFileContents } from './utils/files';

/**
 * This class abstracts the smallest set of information pertains to an asset
 * file in memory
 */
export class Asset {
  name: string;
  contents: Content | undefined;
  iconPath: string;
  distribute?: DistributeConfig;
  protected path: string;
  private LOGGER: Logger;

  /**
   * Creates a new asset
   * @param iconPath Absolute path of the icon folder which this asset belongs
   *                 to All paths in the asset are relative to this iconPath
   * @param config a config object to set the initial properties of the asset
   */
  constructor(iconPath: string, config: AssetConfig) {
    this.LOGGER = logger('icon-magic:icon-models:asset');

    // if iconPath is not absolute, throw an error
    if (!path.isAbsolute(iconPath)) {
      throw new Error(
        'AssetCreationError: iconPath must always be absolute: ${iconPath)'
      );
    }
    this.iconPath = iconPath;

    // if the asset does not have a name, then set the name to be the name of
    // the file itself
    this.name = config.name ? config.name : path.parse(config.path).name;

    // set the path
    this.path = config.path;

    // set the contents only if it is passed in the config
    if (config.contents) {
      this.contents = config.contents;
    }
    if (config.distribute) {
      this.distribute = config.distribute;
    }
    this.LOGGER.debug(`Asset ${this.name} created in ${this.iconPath}`);
  }

  /**
   * @returns The path o an asset which is always relative to the iconpath
   */
  getPath(): string {
    return path.resolve(this.iconPath, this.path);
  }

  /**
   * Sets the path property to a path passed in
   */
  setPath(path: string) {
    this.path = path;
  }

  /**
   * @returns the Asset data that needs to be stored in the config file
   */
  getAssetConfig(): AssetConfig {
    const config = {
      name: this.name,
      path: this.path
    };
    if (this.distribute) config['distribute'] = this.distribute;
    return config;
  }

  /**
   * Returns the content stored in the path of this asset
   */
  async getContents(): Promise<Content> {
    // if it isn't already retrieved, read the file from disk
    if (!this.contents) {
      this.LOGGER.debug(
        `Reading ${this.getPath()}'s file contents from the disk`
      );
      this.contents = await getFileContents(this.getPath());
    }
    return this.contents;
  }
}
