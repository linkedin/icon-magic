import { Icon } from '.';
import { Asset } from './asset';
import { Flavor } from './flavor';

interface WidthHeight {
  width: number;
  height: number;
}

export type AssetSize = number | WidthHeight;
export type AssetResolution = number;
export type Content = Buffer | string;

export interface AssetConfig {
  name?: string;
  path: string;
  contents?: Content;
}

export type Iterant = string[];
export type FlavorType = 'svg' | 'png' | 'webp';
export type FlavorTypeMap = { [K in FlavorType]?: AssetConfig };

export interface FlavorConfig extends AssetConfig {
  types?: FlavorTypeMap;
}

export type PluginFunctionType<T> = (
  flavor: T,
  icon: Icon,
  params?: object // set of iterant values to be passed into the plugin
) => Promise<T | T[]>;

export interface Plugin<T> {
  name: string;
  fn: PluginFunctionType<T>;
  iterants?: Iterant; // the config properßties on which it needs to reculrsively iterate through
  params?: object;
  writeToOutput?: boolean; // Do not set unless for debugging the plugin. By default, this is set to true for the last plugin of each step - build, generate, etc
}

export type BuildPlugin = Plugin<Asset>;
export type GeneratePlugin = Plugin<Flavor>;

/**
 * Properties related t
 */
export interface BuildConfig {
  outputPath?: string;
  plugins?: BuildPlugin[];
}

/**
 * Supported types for generation are svg and raster
 * Raster here represents .png and .webp
 */
export type GenerateType = 'svg' | 'raster';

/**
 * Properties related to a single generation type
 */
interface GenerateTypeConfig {
  name: GenerateType;
  plugins?: GeneratePlugin[];
}

/**
 * Properties related to the generation of an icon from .svg into multiple
 * types(.png, .webp)
 */
export interface GenerateConfig {
  types: GenerateTypeConfig[];
  outputPath?: string;
}

/**
 * Properties related to the distribution of the icon
 */
export interface DistributeConfig {}

/**
 * Properties related to an Icon
 * This should represent the config schema at all times
 */
export type IconConfig = {
  iconPath: string;
  variants: AssetConfig[];
  sourceConfigFile: string;
  sizes: AssetSize[];
  resolutions: AssetResolution[];
  iconName?: string;
  flavors?: FlavorConfig[];
  outputPath: string;
  build?: BuildConfig;
  generate?: GenerateConfig;
  distribute?: DistributeConfig;
};

/**
 * A map containing a path to the icons and their respective config JSONs
 */
export type IconConfigHash = Map<string, IconConfig>;

/**
 * A map containing a path to the icons and their respective Icon class
 * instances
 */
export type IconSetHash = Map<string, Icon>;
