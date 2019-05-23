import { Logger, logger } from '@icon-magic/logger';
import * as path from 'path';

import { Asset } from './asset';
import { Flavor } from './flavor';
import {
  AssetResolution,
  AssetSize,
  BuildConfig,
  DistributeConfig,
  FlavorConfig,
  GenerateConfig,
  IconConfig
} from './interface';
import { exists, isTypeSVG } from './utils/files';

/**
 * Encapsulates what an Icon means It is referenced by a path to it's directory
 * and the directory of icons can be assumed to contain all the different
 * variants and flavors in which the icon is available, in all of it's different
 * types. The config itself is generally more concise and human readable but this
 * class supplements it by providing methods on it and filling in the gaps where
 * they don't exist
 */
export class Icon {
  private LOGGER: Logger;
  iconPath!: string;
  variants: Asset[];
  sourceConfigFile!: string;
  sizes!: AssetSize[];
  resolutions!: AssetResolution[];
  iconName!: string;
  flavors: Map<string, Flavor>;
  outputPath!: string;
  build?: BuildConfig;
  generate?: GenerateConfig;
  distribute?: DistributeConfig;

  /**
   * Creates an Icon instance by creating sub classes for it's variants and
   * flavors
   * @param config Config read from a config file containing all the icon's
   * information
   * @param skipVariantCheck if true, skips the check to verify the existence of
   * variants. This flag is normally set false for generate configs that don't
   * have variants anymore
   */
  constructor(config: IconConfig, skipVariantCheck?: boolean) {
    this.LOGGER = logger('icon-magic:icon-models:icon');

    // copy over all the properties in the config
    for (const key of Object.keys(config)) {
      this[key] = config[key];
    }

    // sets a name to the icon if it doesn't exist already
    if (!config.iconName) {
      this.iconName = path.parse(config.iconPath).name;
    }

    // iterate through the variants and create Asset instances for each variant
    const variants: Asset[] = [];
    for (const variant of config.variants) {
      if (!(variant instanceof Asset)) {
        const variantAsset = new Asset(config.iconPath, variant);

        // only check the variants if the flag is true
        if (!skipVariantCheck) {
          // check to see if the file exists
          if (!exists(variantAsset.getPath())) {
            this.LOGGER.error(
              `MissingVariantError: Variant ${variantAsset.getPath()} missing for icon ${
                this.iconPath
              }`
            );
            continue;
          }

          // check that the asset is an svg file
          if (!isTypeSVG(variantAsset.getPath())) {
            this.LOGGER.error(
              `InvalidVariantError: Variant ${variantAsset.getPath()} of ${
                this.iconPath
              } should be an SVG file`
            );
            continue;
          }
        }

        variants.push(variantAsset);
      }
    }

    // if there are no valid variants, throw an error
    if (!variants.length) {
      throw new Error(
        `NoValidVariantsError: ${
          this.iconPath
        } does not have any valid variants`
      );
    }

    this.variants = variants;

    // if the config has flavors, create Flavor instances for each flavor
    const flavors: Map<string, Flavor> = new Map();
    for (const flavor of config.flavors || []) {
      if (!(flavor instanceof Flavor)) {
        const tmpFlavor = new Flavor(config.iconPath, flavor);
        flavors.set(tmpFlavor.name, tmpFlavor);
      }
    }
    this.flavors = flavors;
  }

  /**
   * @returns the path to output the processed icons
   */
  getIconOutputPath(): string {
    const iconOutputPath = path.join(this.outputPath, this.iconName);

    // unless it's absolute, the outputPath is relative to the cwd
    return path.isAbsolute(iconOutputPath)
      ? iconOutputPath
      : path.join(process.cwd(), iconOutputPath);
  }

  /**
   * @returns a path by appending '/build' to the icon's outputPath
   */
  getBuildOutputPath(): string {
    return path.join(this.getIconOutputPath(), 'build');
  }

  /**
   * Populates object with all Icon data as an object so it can be written to the output
   * directory and
   * @returns object to be set as the config
   */
  getConfig(): IconConfig {
    this.LOGGER.debug(`Creating the config for ${this.iconPath}`);
    // copy all properties have to be defined
    const config: IconConfig = {
      iconPath: '.', // we assume that the config will be written to the icon directory itself
      variants: [], // by instantiaing variants to be an empty array
      sourceConfigFile: path.relative(this.iconPath, this.sourceConfigFile), // again, we resolve this path w.r.t. the icon directory
      sizes: this.sizes,
      resolutions: this.resolutions,
      iconName: this.iconName,
      outputPath: this.outputPath
    };

    // fill out the variant data by getting the config from each
    for (const variant of this.variants) {
      config.variants.push(variant.getAssetConfig());
    }

    // if there are flavors, iterate and add each one
    if (this.flavors) {
      const flavors: FlavorConfig[] = [];
      for (const flavor of this.flavors.values()) {
        flavors.push(flavor.getConfig());
      }
      config.flavors = flavors;
    }

    //copy over the rest of the properties only if they exist
    if (this.build) {
      config.build = this.build;
    }
    if (this.generate) {
      config.generate = this.generate;
    }
    if (this.distribute) {
      config.distribute = this.distribute;
    }

    // return the object
    return config;
  }
}
