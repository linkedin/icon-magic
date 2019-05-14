import * as debugGenerator from 'debug';
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
  iconPath: string;
  variants: Asset[];
  sourceConfigFile: string;
  sizes: AssetSize[];
  resolutions: AssetResolution[];
  iconName: string;
  flavors: Map<string, Flavor>;
  outputPath: string;
  config: IconConfig;

  build?: BuildConfig;
  generate?: GenerateConfig;
  distribute?: DistributeConfig;
  private debug: debugGenerator.IDebugger;

  /**
   * Creates an Icon instance by creating sub classes for it's variants and
   * flavors
   * @param config Config read from a config file containing all the icon's
   * information
   */
  constructor(config: IconConfig) {
    this.debug = debugGenerator('icon-magic:icon-models:icon');
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

        // check to see if the file exists
        try {
          exists(variantAsset.getPath());
        } catch (err) {
          throw err;
        }

        // check that the asset is an svg file
        if (!isTypeSVG(variantAsset.getPath())) {
          throw new Error(`Variant ${variant.path} should be an SVG file`);
        }

        variants.push(variantAsset);
      }
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
   * Extracts the output path from the build config, if present Otherwise it
   * checks if the icon itself has an outputPath If the other two don't exist,
   * it returns a path to the tmp folder in the current directory
   * @returns the output path with respect to a config
   */

  getBuildOutputPath(): string {
    const configOutputPath = path.join(
      this.build ? this.build.outputPath || this.outputPath : this.outputPath,
      this.iconName || path.basename(this.iconPath)
    );
    return path.join(process.cwd(), configOutputPath || './tmp');
  }

  /**
   * Extracts the output path from the generate config, if present Otherwise it
   * checks if the icon itself has an outputPath If the other two don't exist,
   * it returns a path to the tmp folder in the current directory
   * @returns the output path with respect to a config
   */
  generateOutputPath(): string {
    const configOutputPath = path.join(
      this.generate
        ? this.generate.outputPath || this.outputPath
        : this.outputPath,
      this.iconName || path.basename(this.iconPath)
    );
    return path.join(process.cwd(), configOutputPath || './tmp');
  }

  /**
   * @returns All Icon data as an object so it can be written to the output
   * directory
   */
  getConfig(): IconConfig {
    // copy all properties have to be defined
    const config: IconConfig = {
      iconPath: this.iconPath,
      variants: [], // by instantiaing variants to be an empty array
      sourceConfigFile: this.sourceConfigFile,
      sizes: this.sizes,
      resolutions: this.resolutions,
      iconName: this.iconName,
      outputPath: this.outputPath
    };

    // fill out the variant data by getting the config from each
    for (const variant of this.variants) {
      config.variants.push(variant.getConfig());
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
