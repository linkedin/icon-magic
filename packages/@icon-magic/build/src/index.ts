import { loadConfigFile } from '@icon-magic/config-reader';
import {
  Asset,
  BuildPlugin,
  Flavor,
  FlavorConfig,
  Icon,
  IconConfigHash,
  IconSet,
  applyPluginsOnAsset,
  compareAssetHashes,
  createHash,
  saveContentToFile
} from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import { timer } from '@icon-magic/timing';
import * as fs from 'fs-extra';
import * as path from 'path';

const TIMER = timer();
const LOGGER: Logger = logger('icon-magic:build:index');

/**
 * The build is responsible for constructing all the various flavors that an
 * icon can exist in from it's different variants, after applying the build
 * plugins on the variants. It moves these resulting flavors to the destination
 * folder renaming the icon if necessary. It also generates a config file, one
 * for each icon and stores it along with the icon it's in output folder.
 *
 * Build transforms the variants into flavors by applying all the build
 * plugins on each variant of each icon. Plugins are applied in the order in
 * which they appear. This will result in different flavors of the icon, which
 * are added to the icons config.
 * @param iconConfig a map of the iconPaths to it's config json
 */
export async function build(
  iconConfig: IconConfigHash,
  hashing = true
): Promise<IconSet> {
  LOGGER.debug('Icon build has begun');
  TIMER.start();
  // Create icons for all icons within the iconConfig
  const iconSet = new IconSet(iconConfig);
  const outputIconSet: IconSet = new IconSet();

  for (const icon of iconSet.hash.values()) {
    // get the output directory with respect to the current working directory
    const buildOutputPath = icon.getBuildOutputPath();

    // get the new path for the icon in the hash
    const iconOutputPath = icon.getIconOutputPath();

    // runs the plugins on each icon
    let assets: Asset[];
    let iconrc = {};
    const buildConfig = icon.build;

    if (hashing) {
      try {
        iconrc = await loadConfigFile(
          path.join(buildOutputPath, 'iconrc.json')
        );
      } catch (e) {
        // If we get here then the icon has not been built before, we don't have to
        // do anything, just let it build.
      }
    }

    if (buildConfig && buildConfig.plugins && buildConfig.plugins.length) {
      assets = await applyBuildPluginsOnVariants(
        icon,
        await getPlugins(buildConfig.plugins),
        iconrc
      );
    } else {
      // if there are no build plugins, then move all variants to flavors as is
      assets = icon.variants;
    }

    // create the build output directory if it doesn't already exist
    await fs.mkdirp(buildOutputPath);

    // in the icon, update the iconPath to be that of the output path
    icon.iconPath = iconOutputPath;

    // create a new flavor to the icon from each asset obtained by applying the
    // build plugins
    await Promise.all(
      assets.map(asset => saveAssetAsFlavor(asset, icon, buildOutputPath))
    );

    // add it to the outputIconSet's hash map
    outputIconSet.hash.set(iconOutputPath, icon);
    LOGGER.debug(
      `Icon ${icon.iconName} has been written to the hash as ${iconOutputPath}`
    );

    // write the config to the output directory
    LOGGER.debug(`Writing ${icon.iconName}'s iconrc.json to disk`);
    await saveContentToFile(
      buildOutputPath,
      'iconrc',
      JSON.stringify(icon.getConfig(), null, 2),
      'json'
    );
  }

  LOGGER.info(`Building took ${TIMER.end()}`);
  //return the outputIconSet
  return outputIconSet;
}

/**
 * Takes an asset and adds it to the icon by
 * first, writing the asset's contents onto the outputPath
 * and then, updating the icon config to contain a new flavor with this newly
 * written asset
 * @param asset The asset to be added to the icon as a new flavor of the icon
 * @param icon The icon to which the new asset is to be added
 * @param outputPath The path to which the asset is to be written to on disk
 */
export async function saveAssetAsFlavor(
  asset: Asset,
  icon: Icon,
  outputPath: string
): Promise<void> {
  // write contents to outputPath
  const content = await asset.getContents();
  const pathToAsset = `${path.join(outputPath, asset.name)}.svg`;
  // write the file as the name specified in flavor.name
  await fs.writeFile(pathToAsset, content, {
    encoding: 'utf8'
  });
  LOGGER.debug(`Asset ${asset.name} has been written to ${pathToAsset}`);
  const variant = icon.variants.find(
    (variant: Asset) => variant.name === asset.name
  );
  const variantContent = variant ? await variant.getContents() : '';
  // create a new Flavor instance with the asset once the asset is written to
  // disk
  const flavor = new Flavor(
    icon.iconPath,
    Object.assign(asset.getAssetConfig(), {
      sourceHash: createHash(variantContent) // Add the sourceHash of the input variant
    })
  );

  // set the path to point to the newly created file as it could've been
  // renamed in above if it's name was different from the file name
  // the path should always be relative to the iconPath
  flavor.setPath(path.relative(icon.iconPath, pathToAsset));

  // push this asset as a flavor onto the icon
  icon.flavors.set(flavor.name, flavor);
}

/**
 * Iterates through the variants of the icon and applies all the plugins
 * @param icon the icon on whose variants the build plugins need to be applied
 * @param plugins the set of plugins to apply on the icon's variants
 * @returns a promise that resolves to the assets obtained after applying the
 * plugins
 */
export async function applyBuildPluginsOnVariants(
  icon: Icon,
  plugins: BuildPlugin[],
  iconrc?: object
): Promise<Asset[]> {
  let assets: Asset[] = [];
  for (const iconVariant of icon.variants) {
    if (iconrc) {
      const savedFlavorConfigs: FlavorConfig[] = iconrc['flavors'].filter(
        (flav: Flavor) => {
          const regex = RegExp(`^${iconVariant.name}\b`);
          return regex.test(flav.name);
        }
      );
      if (savedFlavorConfigs.length) {
        const allFlavorsMatch = savedFlavorConfigs.every(
          async (savedFlavorConfig: FlavorConfig) => {
            await compareAssetHashes(iconVariant, savedFlavorConfig);
          }
        );
        if (allFlavorsMatch) {
          // This variant has already been built
          LOGGER.info(
            `Variant ${iconVariant.name} has already been built, skipping build plugins.`
          );
          savedFlavorConfigs.forEach((savedFlavorConfig: FlavorConfig) => {
            const savedFlavor: Flavor = new Flavor(
              icon.iconPath,
              savedFlavorConfig
            );
            assets = assets.concat(savedFlavor);
          });
          continue;
        }
      }
    }
    assets = assets.concat(
      // TODO: fork off a separate node process for each variant here
      await applyPluginsOnAsset(iconVariant, icon, plugins)
    );
  }
  return assets;
}

/**
 * Returns an instance of plugins all with the fn property
 * If the passed in plugin does not have fn defined on it, we attempt to find
 * the plugin within generate/plugins folder by matching the name
 * @param plugins Array of plugins to sanitize
 */
async function getPlugins(plugins: BuildPlugin[]): Promise<BuildPlugin[]> {
  return await Promise.all(
    plugins.map(async plugin => {
      // if the plugin has a function, return the plugin
      if (plugin.fn) return plugin;
      // import the plugin from ./plugins
      else {
        let pluginFromFile: BuildPlugin;
        try {
          pluginFromFile = await import(`./plugins/${plugin.name}`);
          // override the plugin's data with the missing fn
          plugin.fn = pluginFromFile[`${kebabToCamel(plugin.name)}`].fn;
          return plugin;
        } catch (e) {
          throw e;
        }
      }
    })
  );
}

/**
 * Convert a string from kebab-case to camelCase
 * @param s string in kebab-case to convert to camelCase
 * @returns string with in camelCase
 */
function kebabToCamel(s: string): string {
  return s.replace(/(\-\w)/g, m => {
    return m[1].toUpperCase();
  });
}
