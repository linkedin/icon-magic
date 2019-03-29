import {
  BuildPlugin,
  Icon,
  Asset,
  Flavor,
  applyPluginsOnAsset,
  IconConfigHash,
  IconSet
} from '@icon-magic/icon-models/';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as debugGenerator from 'debug';

let debug = debugGenerator('icon-magic:build:index');

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
  let iconSet = new IconSet(iconConfig);
  let outputIconSet: IconSet = new IconSet();

  for (let icon of iconSet.hash.values()) {
    // runs the plugins on each icon
    let assets: Asset[];
    let buildConfig = icon.build;
    if (buildConfig && buildConfig.plugins) {
      assets = await applyBuildPluginsOnVariants(icon, buildConfig.plugins);
    } else {
      // if the plugins weren't applied, then move all variants to flavors as is
      assets = icon.variants;
    }
    // get the output directory with respect to the current working directory
    // and then create a directory with the iconName
    let outputPath = icon.buildOutputPath;

    // create the directory if it doesn't already exist
    await fs.mkdirp(outputPath);
    let promises = [];

    // for each new asset that was returned from the build plugins, write them
    // to the output directory
    for (let asset of assets) {
      // write contents to outputPath
      let content = await asset.getContents();
      // write the file as the name specified in flavor.name
      let writePromise = await fs.writeFile(
        `${path.join(outputPath, asset.name)}.svg`,
        content,
        {
          encoding: 'utf8'
        }
      );
      debug(`Asset ${asset.name} has been written to ${outputPath}`);

      // create a new Flavor instance with the asset
      let flavor = new Flavor(icon.iconPath, asset);

      // set the path to point to the newly created file as it oculd've been
      // renamed in above if it's name was different from the file name
      flavor.path = `./${asset.name}.svg`;

      // push this asset as a flavor onto the icon
      await icon.flavors.set(flavor.name, flavor);
      debug(`Flavor ${flavor.name} has been added to ${icon.iconName}`);

      promises.push(writePromise);
    }
    // in the icon, update the iconPath to be that of the output path
    icon.iconPath = outputPath;
    // add it to the outputIconSet's hash map
    outputIconSet.hash.set(outputPath, icon);
    debug(
      `Icon ${icon.iconName} has been written to the hash as ${icon.iconPath}`
    );

    await Promise.all(promises);

    // write the config to the output directory
    icon.writeConfigToDisk(icon.buildOutputPath);
  }

  //return the outputIconSet
  return outputIconSet;
}

/**
 * Iterates through the variants of the icon and applies all the plugins
 * @param icon the icon on whose variants the build plugins need to be applied
 * @param plugins the set of plugins to apply on the icon's variants
 * @returns a promise that resolves to the assets obtained after applying the
 * plugins
 */
async function applyBuildPluginsOnVariants(
  icon: Icon,
  plugins: BuildPlugin[]
): Promise<Asset[] | Flavor[]> {
  let promises = [] as Asset[];
  for (let iconVariant of icon.variants) {
    promises = promises.concat(
      // TODO: fork off a separate node process for each variant here
      await applyPluginsOnAsset(iconVariant, icon, plugins)
    );
  }
  return Promise.all(promises);
}
