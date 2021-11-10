import * as path from 'path';

import { Asset } from './asset';
import { FlavorConfig } from './interface';

/**
 * In it's simplest definition, a Flavor is an Asset with types This class
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
   * @param config config properties for instantiating the Flavor
   */
  constructor(iconPath: string, config: FlavorConfig) {
    // only flavors have a sourceHash
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
  }

  /**
   * Populates FlavorConfig with flavor data that needs to be stored and
   * @returns FlavorConfig object to be set as the config
   */
  getConfig(): FlavorConfig {
    let flavorTypes;

    const config:FlavorConfig = {
      name: this.name,
      path: `./${path.relative(this.iconPath, this.getPath())}`,
    };

    //copy over the rest of the properties only if they exist
    if (this.buildSourceHash) {
      config.buildSourceHash = this.buildSourceHash;
    }
    if (this.generateSourceHash) {
      config.generateSourceHash = this.generateSourceHash;
    }
    if (this.imageset) {
      config.imageset = this.imageset;
    }
    if (this.colorScheme) {
      config.colorScheme = this.colorScheme;
    }
    if (this.sizes) {
      config.sizes = this.sizes;
    }

    // return only flavor data
    if (this.types) {
      flavorTypes = {};
      for (const [key, asset] of this.types) {
        flavorTypes[key] = asset.getAssetConfig();
      }
      config.types = flavorTypes;
    }

    return config;
  }
}
