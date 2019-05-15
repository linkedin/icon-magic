import * as path from 'path';

import { Asset } from './asset';
import { FlavorConfig } from './interface';

/**
 * In it's simplist definition, a Flavor is an Asset with types This class
 * contains Assets for all the different types in which it can exist For
 * example, a Flavor consists of it's source svg as well as paths to it's png
 * and webp assets
 */
export class Flavor extends Asset {
  types: Map<string, Asset>;
  private flavorConfig: FlavorConfig ;

  /**
   *
   * @param iconPath Absolute path to the icon directory of which this flavor is
   * a part of
   * @param config config porperties for instantiating the Flavor
   */
  constructor(iconPath: string, config: FlavorConfig) {
    super(iconPath, config);
    if (config.types) {
      //if types is an object, convert it to a map
      if (!(config.types instanceof Map)) {
        const types = new Map();
        for (const [key, asset] of Object.entries(config.types)) {
          if (asset) {
            types.set(key, new Asset(iconPath, asset));
          }
        }
        this.types = types;
      } else {
        // if it's already a map, assign it to types
        this.types = config.types;
      }
    } else {
      // create a an empty map
      this.types = new Map();
    }
    this.flavorConfig = this.configureConfig();
  }

  configureConfig() {
    let flavorTypes;
    // return only flavor data
    if (this.types) {
      flavorTypes = {};
      for (const [key, asset] of this.types) {
        flavorTypes[key] = asset.getAssetConfig();
      }
    }

    return {
      name: this.name,
      path: `./${path.relative(this.iconPath, this.getPath())}`,
      types: flavorTypes
    };
  }
  /**
   * returns flavor data that needs to be stored in the config file
   */
  getFlavorConfig(): FlavorConfig {
    return this.flavorConfig;
  }
}
