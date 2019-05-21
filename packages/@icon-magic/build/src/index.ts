import {
  Asset,
  BuildPlugin,
  Flavor,
  Icon,
  IconConfigHash,
  IconSet,
  applyPluginsOnAsset,
  saveContentToFile
} from '@icon-magic/icon-models';
import * as debugGenerator from 'debug';
import * as fs from 'fs-extra';
import * as path from 'path';

const debug = debugGenerator('icon-magic:build:index');

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
export async function build(iconConfig: IconConfigHash): Promise<IconSet> {
  debug('Icon build has begun');
  // Create icons for all icons within the iconConfig
  const iconSet = new IconSet(iconConfig);
  const outputIconSet: IconSet = new IconSet();

  for (const icon of iconSet.hash.values()) {
    // runs the plugins on each icon
    let assets: Asset[];
    const buildConfig = icon.build;
    if (buildConfig && buildConfig.plugins) {
      assets = await applyBuildPluginsOnVariants(icon, buildConfig.plugins);
    } else {
      // if there are no build plugins, then move all variants to flavors as is
      assets = icon.variants;
    }
    // get the output directory with respect to the current working directory
    // and then create a directory with the iconName
    const outputPath = icon.getBuildOutputPath();

    // create the directory if it doesn't already exist
    await fs.mkdirp(outputPath);

    // create a new flavor to the icon from each asset obtained by applying the
    // build plugins
    await Promise.all(
      assets.map(asset => saveAssetAsFlavor(asset, icon, outputPath))
    );

    // in the icon, update the iconPath to be that of the output path
    icon.iconPath = outputPath;
    // add it to the outputIconSet's hash map
    outputIconSet.hash.set(outputPath, icon);
    debug(
      `Icon ${icon.iconName} has been written to the hash as ${icon.iconPath}`
    );

    // write the config to the output directory
    debug(`Writing ${icon.iconName}'s iconrc.json to disk`);
    await saveContentToFile(
      icon.getBuildOutputPath(),
      'iconrc',
      JSON.stringify(icon.getConfig(), null, 2),
      'json'
    );
  }

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
async function saveAssetAsFlavor(
  asset: Asset,
  icon: Icon,
  outputPath: string
): Promise<void> {
  // write contents to outputPath
  const content = await asset.getContents();
  // write the file as the name specified in flavor.name
  await fs.writeFile(`${path.join(outputPath, asset.name)}.svg`, content, {
    encoding: 'utf8'
  });
  debug(`Asset ${asset.name} has been written to ${outputPath}`);

  // create a new Flavor instance with the asset once the asset is written to
  // disk
  const flavor = new Flavor(icon.iconPath, asset.getAssetConfig());

  // set the path to point to the newly created file as it could've been
  // renamed in above if it's name was different from the file name
  flavor.setPath(`./${asset.name}.svg`);

  // push this asset as a flavor onto the icon
  icon.flavors.set(flavor.name, flavor);
  debug(`Flavor ${flavor.name} has been added to ${icon.iconName}`);
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
  plugins: BuildPlugin[]
): Promise<Asset[]> {
  let assets: Asset[] = [];
  for (const iconVariant of icon.variants) {
    assets = assets.concat(
      // TODO: fork off a separate node process for each variant here
      await applyPluginsOnAsset(iconVariant, icon, plugins)
    );
  }
  return assets;
}
