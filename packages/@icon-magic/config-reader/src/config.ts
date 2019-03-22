import * as path from 'path';
import * as glob from 'glob';
import { loadConfigFile } from './config-loader';
import { validateConfigSchema } from './config-validator';
import { Icon } from '@icon-magic/icon-models';
import { IconSetHashInterface } from '@icon-magic/icon-models/src/interface';
import { isDirectory } from '@icon-magic/icon-models/dist/src/utils/files';

export class Config {
  iconSetHash: IconSetHashInterface;

  constructor(configFiles: string[]) {
    this.iconSetHash = new Map();
    for (let configFile of configFiles) {
      //validate all the config files
      const configJson = loadConfigFile(configFile);
      try {
        validateConfigSchema(configJson);
      } catch (err) {
        throw new Error(`Configuration in ${configFile} is invalid:\n`);
      }

      this.constructIconHash(configFile, configJson);
    }

    // resolve paths in the hash map with respect to the icon
    this.resolveVariantPaths();

    console.debug(JSON.stringify([...this.iconSetHash]));
  }

  /**
   * Iterates through the paths of the config file and populates the iconSetHash
   * @param config the JSON object obtained from the loading the config file
   */
  constructIconHash(configFile: string, configJson: Icon) {
    //iconPath
    const resolvedIconPaths = path.resolve(
      path.parse(configFile).dir,
      configJson.iconPath
    );
    console.debug(`Resolving the icon path: ${resolvedIconPaths}`);

    // TODO: Determine if we can cache the stats for all the glob files via an option
    let iconPaths = glob
      .sync(resolvedIconPaths)
      .filter(iconPath => isDirectory(iconPath));
    console.debug(
      `Resolving all the glob patterns to get the set of icon paths: ${iconPaths}`
    );

    // determine the source config files for each icon and make a deep copy
    for (let iconPath of iconPaths) {
      //extend the generic config by resolving the generic paths

      let iconConfig: Icon = new Icon(
        Object.assign(configJson, {
          iconPath,
          iconName: configJson.iconName || path.parse(iconPath).name,
          sourceConfigFile: configFile
        })
      );

      this.add(iconPath, iconConfig);
    }
  }

  add(iconPath: string, iconConfig: Icon) {
    // if it exists determine whether or not to override
    let existingConfig = this.iconSetHash.get(iconPath);
    if (existingConfig) {
      let existingConfigDistance = this.getDistanceBetweenPaths(
        existingConfig.sourceConfigFile,
        iconPath
      );
      let newConfigDistance = this.getDistanceBetweenPaths(
        iconConfig.sourceConfigFile,
        iconPath
      );

      if (existingConfigDistance > newConfigDistance) {
        this.iconSetHash.set(iconPath, iconConfig);
      }
    } else {
      this.iconSetHash.set(iconPath, iconConfig);
    }
  }

  resolveVariantPaths() {
    for (let iconConfig of this.iconSetHash.values()) {
      iconConfig.resolveVariants();
    }
  }

  getDistanceBetweenPaths(path1: string, path2: string) {
    return path.relative(path1, path2).split('/').length - 1;
  }

  getIconSetHash() {
    return this.iconSetHash;
  }
}
