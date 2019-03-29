import {
  IconConfig,
  AssetSize,
  AssetResolution,
  BuildConfig,
  GenerateConfig,
  DistributeConfig,
  FlavorConfig
} from './interface';
import { exists, isTypeSVG } from './utils/files';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as debugGenerator from 'debug';
import { Asset } from './asset';
import { Flavor } from './flavor';

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
    Object.assign(this, config);

    // sets a name to the icon if it doesn't exist already
    if (!config.iconName) {
      this.iconName = path.parse(config.iconPath).name;
    }

    // iterate through the variants and create Asset instances for each variant
    let variants: Asset[] = [];
    for (let variant of config.variants) {
      if (!(variant instanceof Asset)) {
        let variantAsset = new Asset(config.iconPath, variant);

        // check to see if the file exists
        try {
          exists(variantAsset.path);
        } catch (err) {
          throw err;
        }

        // check that the asset is an svg file
        if (!isTypeSVG(variantAsset.path)) {
          throw new Error(`Variant ${variant.path} should be an SVG file`);
        }

        variants.push(variantAsset);
      }
    }
    this.variants = variants;

    // if the config has flavors, create Flavor instances for each flavor
    let flavors: Map<string, Flavor> = new Map();
    for (let flavor of config.flavors || []) {
      if (!(flavor instanceof Flavor)) {
        let tmpFlavor = new Flavor(config.iconPath, flavor);
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

  get buildOutputPath(): string {
    let configOutputPath = path.join(
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
  get generateOutputPath(): string {
    let configOutputPath = path.join(
      this.generate
        ? this.generate.outputPath || this.outputPath
        : this.outputPath,
      this.iconName || path.basename(this.iconPath)
    );
    return path.join(process.cwd(), configOutputPath || './tmp');
  }

  async writeConfigToDisk(filePath: string): Promise<void> {
    // create the directory if it doesn't exist
    await fs.mkdirp(filePath);
    // write the config to the output directory
    this.debug(`Writing ${this.iconName}'s iconrc.json to ${filePath}`);
    await fs.writeFile(
      `${path.join(filePath, 'iconrc.json')}`,
      JSON.stringify(this.config, null, 4)
    );
  }

  /**
   * @returns All Icon data as an object so it can be written to the output
   * directory
   */
  get config(): IconConfig {
    // copy all properties have to be defined
    let config: IconConfig = {
      iconPath: this.iconPath,
      variants: [], // by instantiaing variants to be an empty array
      sourceConfigFile: this.sourceConfigFile,
      sizes: this.sizes,
      resolutions: this.resolutions,
      iconName: this.iconName,
      outputPath: this.outputPath
    };

    // fill out the variant data by getting the config from each
    for (let variant of this.variants) {
      config.variants.push(variant.config);
    }

    // if there are flavors, iterate and add each one
    if (this.flavors) {
      let flavors: FlavorConfig[] = [];
      for (let flavor of this.flavors.values()) {
        flavors.push(flavor.config);
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
