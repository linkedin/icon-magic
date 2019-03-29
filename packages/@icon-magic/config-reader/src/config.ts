import * as path from 'path';
import * as glob from 'glob';
import * as debugGenerator from 'debug';
import { loadConfigFile } from './config-loader';
import { validateConfigSchema } from './config-validator';
import { IconConfig, IconConfigHash } from '@icon-magic/icon-models';
import { isDirectory } from './helpers/files';

/**
 * This class is responsible for building the icon-config mapping from a set of
 * config files
 *
 * Icons can be specified as globs in the config file and we can have a single
 * config file for multiple icons
 *
 * Similarly, a single icon can have multiple config files in it's ancestory
 *
 * This class finds the closing config file to an icon, and copies it's contents
 * into a map that's accessed by the path to the icon
 */
export class Config {
  /**
   * A mapping of the icon to the config associated with the icon
   */
  iconConfigHash: IconConfigHash;

  private debug: debugGenerator.IDebugger;

  /**
   * Takes in a set of config files and extracts icons from it Creating an
   * instance of this will automatically populate it's publicly exposed
   * iconConfigHash
   * @param configFiles Takes in a set of config files
   */
  constructor(configFiles: string[]) {
    this.debug = debugGenerator('icon-magic/config-reader/config');

    this.iconConfigHash = new Map();
    // For each config file, find the icons and it stands for and add them to the map
    for (let configFile of configFiles) {
      // but first, validate the config file
      const configJson = loadConfigFile(configFile);
      try {
        validateConfigSchema(configJson);
        this.debug(`Configuration in ${configFile} is valid`);
      } catch (err) {
        throw new Error(`Configuration in ${configFile} is invalid:\n`);
      }

      // then start building the hash from the config json
      this.constructConfigHash(configFile, configJson);
    }

    this.debug(JSON.stringify([...this.iconConfigHash]));
  }

  /**
   * Iterates through the paths in the configJSON and populates the
   * iconConfigHash
   * @param configFile the path to the config file. This is used to find it's
   * distance from the icon
   * @param configJson the config itself that contains the glob of icons
   */
  private constructConfigHash(
    configFile: string,
    configJson: IconConfig
  ): void {
    //iconPath
    const resolvedIconPaths = path.resolve(
      path.parse(configFile).dir,
      configJson.iconPath
    );
    this.debug(`Resolving the icon path: ${resolvedIconPaths}`);

    // TODO: Determine if we can cache the stats for all the glob files via an option
    let iconPaths = glob
      .sync(resolvedIconPaths)
      .filter(iconPath => isDirectory(iconPath));
    this.debug(
      `Resolving all the glob patterns to get the set of icon paths: ${iconPaths}`
    );

    // determine the source config files for each icon and make a deep copy
    for (let iconPath of iconPaths) {
      // create a deep clone of the config so we're not overriding the main one
      let newConfig: IconConfig = JSON.parse(JSON.stringify(configJson));

      // extend the generic config data with data specific to this iconPath
      this.add(
        iconPath,
        Object.assign(newConfig, {
          iconPath,
          sourceConfigFile: configFile
        })
      );
    }
  }

  /**
   * We add a config file to the mapping only if it's most relevant to the icon
   * This is calculated by looking at the distance of the icon from the config
   * file itself We only add a copy of the config against the icon if the
   * distance is shorter
   * @param iconPath the icon directory
   * @param iconConfig the config file that can potentially pertain to the icon
   */
  private add(iconPath: string, iconConfig: IconConfig): void {
    let existingConfig = this.iconConfigHash.get(iconPath);
    // if it exists determine whether or not to override
    if (existingConfig) {
      // get the distance between the icon dir and the existing config file
      let existingConfigDistance = this.getDistanceBetweenPaths(
        existingConfig.sourceConfigFile,
        iconPath
      );
      // get the distance between the icon dir and the new config file
      let newConfigDistance = this.getDistanceBetweenPaths(
        iconConfig.sourceConfigFile,
        iconPath
      );

      // only add the new config to the icon, if it's closer to the icon
      if (existingConfigDistance > newConfigDistance) {
        this.iconConfigHash.set(iconConfig.iconPath, iconConfig);
      }
    } else {
      // if there is no conflict, add the config to the hash
      this.iconConfigHash.set(iconConfig.iconPath, iconConfig);
    }
    this.debug(this.iconConfigHash);
  }

  /**
   * Counts the no. of levels between tßwo directories within a file system
   * @param path1 path to first directory
   * @param path2 path to the second directory
   * @returns the no. of levels
   */
  private getDistanceBetweenPaths(path1: string, path2: string): number {
    return path.relative(path1, path2).split('/').length - 1;
  }
}
