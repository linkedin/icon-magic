import { FlavorConfig } from './interface';
import { Asset } from './asset';
import * as path from 'path';

/**
 * In it's simplist definition, a Flavor is an Asset with types This class
 * contains Assets for all the different types in which it can exist For
 * example, a Flavor consists of it's source svg as well as paths to it's png
 * and webp assets
 */
export class Flavor extends Asset {
  types: Map<string, Asset>;

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
        let types = new Map();
        for (let [key, asset] of Object.entries(config.types)) {
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
  }

  /**
   * returns  flavor data that needs to be stored in the config file
   */
  get config(): FlavorConfig {
    let flavorTypes;
    // return only flavor data
    if (this.types) {
      flavorTypes = {};
      for (let [key, asset] of this.types) {
        flavorTypes[key] = asset.config;
      }
    }

    return {
      name: this.name,
      path: `./${path.relative(this.iconPath, this.path)}`,
      types: flavorTypes
    };
  }
}
