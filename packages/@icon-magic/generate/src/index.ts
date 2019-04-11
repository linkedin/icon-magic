import {
  Asset,
  Flavor,
  GeneratePlugin,
  Icon,
  IconSet,
  applyPluginsOnAsset
} from '@icon-magic/icon-models';
import * as debugGenerator from 'debug';

import { svgGenerate } from './plugins/svg-generate';
import { svgToRaster } from './plugins/svg-to-raster';

const debug = debugGenerator('icon-magic:generate:index');

/**
 * Generate transorms the set of .svg flavors to their types by running a set of
 * plugins based on the type in which we want the output. For example, we can
 * have a different set of plugins to obtain the optimized svg and a different
 * set to get a .png "type".
 *
 * After generate has applied all the plugins based on type, we now get flavors
 * with types that contain paths to the newly created .type asset. Generate also
 * updates the icon config with the newly generated types.
 * @param iconSet mapping of the iconPath to the Icon class
 */
export async function generate(iconSet: IconSet): Promise<void> {
  debug('Icon generation has begun');
  for (const icon of iconSet.hash.values()) {
    // runs the plugins on each icon
    const generateConfig = icon.generate;
    if (generateConfig) {
      let svgAssets: Asset[] = [];
      let rasterAssets: Asset[] = [];
      for (const generateType of generateConfig && generateConfig.types) {
        switch (generateType.name) {
          case 'svg': {
            svgAssets = svgAssets.concat(
              await applyGeneratePluginsOnFlavors(icon, new Array(svgGenerate))
            );
            break;
          }
          case 'raster': {
            rasterAssets = await applyGeneratePluginsOnFlavors(
              icon,
              new Array(svgToRaster)
            );
            break;
          }
          default: {
            // do nothing
            break;
          }
        }
      }
      await Promise.all(svgAssets);
      await Promise.all(rasterAssets);
    }

    // write the icon config to disk
    await icon.writeConfigToDisk(icon.generateOutputPath);
  }
}

/**
 * Iterates through the flavors of the icon and applies the plugins passed into
 * this function on all the flavors of the icon
 * @param icon the icon on whose flavors the plugins have to be applied
 * @param plugins Set of plugins to be be applied on all flavors of the icon
 */
async function applyGeneratePluginsOnFlavors(
  icon: Icon,
  plugins: GeneratePlugin[]
): Promise<Asset[] | Flavor[]> {
  let promises: Asset[] = [];
  if (icon.flavors) {
    for (const iconFlavor of icon.flavors.values()) {
      debug(`Applying plugins on ${icon.iconName}'s ${iconFlavor.name}`);
      promises = promises.concat(
        // TODO: fork off a separate node process for each variant here
        await applyPluginsOnAsset(iconFlavor, icon, plugins)
      );
    }
  }
  promises.forEach(flavor => icon.flavors.set(flavor.name, flavor as Flavor));
  return Promise.all(promises);
}
