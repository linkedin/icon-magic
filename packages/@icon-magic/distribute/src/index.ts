import { Logger, logger } from '@icon-magic/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

import {
  Asset,
  FlavorType,
  Icon,
  IconConfigHash,
  IconSet
} from '@icon-magic/icon-models';

const LOGGER: Logger = logger('icon-magic:distribute/index');

interface ContentImage {
  idiom: string;
  scale: string;
  filename: string;
}

/**
 * Distributes a set of icons to the output folder based on type
 * @param iconSet set of icons to be moved to the output folder
 * @param flag createImageSet, distributeByResolution
 * @param outputPath output directory path to copy the assets to
 */
export async function distributeByFlag(
  iconConfig: IconConfigHash,
  outputPath: string,
  flag?: string
): Promise<void> {
  LOGGER.debug(`entering distribute with ${flag}`);
  const iconSet = new IconSet(iconConfig, true);

  for (const icon of iconSet.hash.values()) {
    switch (flag) {
      case 'createImageSet': {
        await createImageSet(icon, outputPath);
      }
      case 'distributeByResolution': {
        await distributeByResolution(icon, outputPath);
      }
      default: {
        await distributeSvg(icon, outputPath);
      }
    }
  }
}

async function createImageSet(icon: Icon, outputPath: string) {
  LOGGER.debug(`Creating imageSet for ${icon.iconName}`);
  const assets = getIconFlavorsByType(icon, 'png');
  const promises = [];
  const ASSET_CATALOG = 'Contents.json'; // as defined for iOS
  for (const asset of assets) {
    const assetNameForCatalog = `${icon.iconName}_${path.basename(asset.path)}`;

    // strip the resolution from the asset name to get the name of the imageset
    const outputIconDir = path.join(
      outputPath,
      `${assetNameForCatalog.split('@')[0]}.imageset`
    );

    await fs.mkdirp(outputIconDir);

    const assetCatalogPath = path.join(outputIconDir, ASSET_CATALOG);
    let images: ContentImage[];
    if (fs.existsSync(assetCatalogPath)) {
      const assetCatalogContents = await loadJSONFile(assetCatalogPath);
      images = assetCatalogContents.images;
    } else {
      images = [];
    }

    promises.push(
      fs.copy(asset.path, path.join(outputIconDir, assetNameForCatalog))
    );

    // update the assetCatalog if it doesn't contain the asset already
    const doesImageExist = images.find(
      img => img.filename === assetNameForCatalog
    );
    if (!doesImageExist) {
      images.push({
        idiom: 'universal',
        scale: getAssetResolutionFromName(asset, true),
        filename: assetNameForCatalog
      });
      await writeJSONfile(assetCatalogPath, { images });
    }
  }
  return Promise.all(promises);
}

async function distributeByResolution(icon: Icon, outputPath: string) {
  LOGGER.debug(`distributeByResolution for ${icon.iconName}`);
  const assets = getIconFlavorsByType(icon, 'webp');
  let outputIconDir;
  // copy all assets to the output icon directory
  const promises = [];
  for (const asset of assets) {
    // the output folder is the folder by resolution
    outputIconDir = path.join(outputPath, getAssetResolutionFromName(asset));
    await fs.mkdirp(outputIconDir);

    // append the icon name to the asset since all icons go into a single
    // directory
    // TODO: have icons have a category field in their config and prepend the
    // category to the asset name. Eg: nav_iconName_assetName
    promises.push(
      fs.copy(
        asset.path,

        path.join(
          outputIconDir,
          `${icon.iconName}_${path.basename(asset.path)}`
        )
      )
    );
  }
  return Promise.all(promises);
}

async function distributeSvg(icon: Icon, outputPath: string) {
  LOGGER.debug(`distributeSvg for ${icon.iconName}`);
  const assets = getIconFlavorsByType(icon, 'svg');
  const outputIconDir = path.join(outputPath, icon.iconName);
  await fs.mkdirp(outputIconDir);
  // copy all assets to the output icon directory
  const promises = [];
  for (const asset of assets) {
    promises.push(
      fs.copy(asset.path, path.join(outputIconDir, path.basename(asset.path)))
    );
  }
  return Promise.all(promises);
}

/**
 * Returns a list of Flavors
 * @param icon Icon whose flavors are to be returned
 * @param type The type to which to filter the icon's flavors by
 */
function getIconFlavorsByType(icon: Icon, type: FlavorType): Asset[] {
  return Array.from(icon.flavors.values())
    .filter(flavor => {
      return flavor.types.has(type);
    })
    .map(flavor => flavor.types.get(type) as Asset); // type casting here as we have checked for whether the flavor has the type above
}

function getAssetResolutionFromName(
  asset: Asset,
  getAsScale?: Boolean
): string {
  let resolution;
  let scale;
  switch (true) {
    case /@1.5/.test(asset.name): {
      resolution = 'drawable-mdpi';
      scale = '1.5x';
      break;
    }
    case /@1/.test(asset.name): {
      resolution = 'drawable-hdpi';
      scale = '1x';
      break;
    }
    case /@2/.test(asset.name): {
      resolution = 'drawable-xhdpi';
      scale = '2x';
      break;
    }
    case /@3/.test(asset.name): {
      resolution = 'drawable-xxhdpi';
      scale = '3x';
      break;
    }
    default: {
      resolution = 'drawable-xxxhdpi';
      scale = '4x';
      break;
    }
  }
  return getAsScale ? scale : resolution;
}

/**
 * Loads a JSON from a file.
 * @param filePath The filename to load.
 * @returns The JSON contents as an object
 */
async function loadJSONFile(filePath: string): Promise<object> {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeJSONfile(filePath: string, data: object) {
  return fs.writeFile(`${path.join(filePath)}`, JSON.stringify(data, null, 2));
}

/**
 * DELETE EVERYTHING BELOW THIS
 */
export async function moveIllustrations(inputPath: string, outputPath: string) {
  const dirs = await getDirs(inputPath);

  for (const dir of dirs) {
    const files = await fs.readdir(`${inputPath}/${dir}`);
    for (const file of files) {
      let iconName = path.parse(file).name;
      let fileName;
      switch (true) {
        case /premium/.test(iconName): {
          fileName = `premium-${dir}.svg`;
          iconName = iconName.replace('-premium', '');
          break;
        }
        case /muted/.test(iconName): {
          fileName = `muted-${dir}.svg`;
          iconName = iconName.replace('-muted', '');
          break;
        }
        case /inverse/.test(iconName): {
          fileName = `inverse-${dir}.svg`;
          iconName = iconName.replace('-inverse', '');
          break;
        }
        default: {
          fileName = `default-${dir}.svg`;
          break;
        }
      }
      const outputDir = `${outputPath}/${iconName}`;
      await fs.mkdirp(outputDir);
      console.log(`copying ${inputPath}/${dir}/${file} to ${outputDir}`);
      await fs.copy(`${inputPath}/${dir}/${file}`, `${outputDir}/${fileName}`);
    }
  }
}

export async function moveReactions(inputPath: string, outputPath: string) {
  const dirs = await getDirs(inputPath);

  for (const dir of dirs) {
    const files = await fs.readdir(`${inputPath}/${dir}`);
    for (const file of files) {
      let iconName = path.parse(file).name;
      let fileName;
      switch (true) {
        case /inverse/.test(iconName): {
          fileName = `inverse-${dir}.svg`;
          iconName = iconName.replace('-inverse', '');
          break;
        }
        default: {
          fileName = `default-${dir}.svg`;
          break;
        }
      }
      const outputDir = `${outputPath}/${iconName}`;
      await fs.mkdirp(outputDir);
      console.log(`copying ${inputPath}/${dir}/${file} to ${outputDir}`);
      await fs.copy(`${inputPath}/${dir}/${file}`, `${outputDir}/${fileName}`);
    }
  }
}

export async function moveLogos(inputPath: string, outputPath: string) {
  const icons = await getDirs(inputPath);
  for (const icon of icons) {
    let iconName = path.parse(icon).name;
    let fileName;

    switch (true) {
      case /color/.test(iconName): {
        fileName = 'default.svg';
        iconName = iconName.replace('-color', '');
        iconName = iconName.replace('-app', '');
        break;
      }
      case /black/.test(iconName): {
        fileName = 'black.svg';
        iconName = iconName.replace('-black', '');
        iconName = iconName.replace('-app', '');
        break;
      }
      default: {
        fileName = 'default.svg';
        iconName = iconName.replace('-app', '');
        break;
      }
    }
    const existingIcon = `${inputPath}/${icon}/@4x/40dp.svg`;
    if (fileName) {
      const outputFile = `${outputPath}/${iconName}/${fileName}`;
      await fs.mkdirp(`${outputPath}/${iconName}`);
      if (fs.existsSync(existingIcon)) {
        console.log(`copying ${existingIcon} to ${outputFile}`);
        await fs.copy(existingIcon, `${outputPath}/${iconName}/${fileName}`);
      }
    }
  }
}

export async function moveSocial(inputPath: string, outputPath: string) {
  const icons = await getDirs(inputPath);
  for (const icon of icons) {
    let iconName = path.parse(icon).name;
    let fileName;
    switch (true) {
      case /color/.test(iconName): {
        fileName = 'color.svg';
        iconName = iconName.replace('-color', '');
        break;
      }
      case /black/.test(iconName): {
        fileName = 'solid.svg';
        iconName = iconName.replace('-black', '');
        break;
      }
      default:
        break;
    }
    const existingIcon = `${inputPath}/${icon}/24dp.svg`;
    if (fileName) {
      const outputFile = `${outputPath}/${iconName}/${fileName}`;
      await fs.mkdirp(`${outputPath}/${iconName}`);
      if (fs.existsSync(existingIcon)) {
        console.log(`copying ${existingIcon} to ${outputFile}`);
        await fs.copy(existingIcon, `${outputPath}/${iconName}/${fileName}`);
      }
    }
  }
}

export async function moveUi(inputPath: string, outputPath: string) {
  const icons = await getDirs(inputPath);
  for (const icon of icons) {
    let iconName = path.parse(icon).name;
    let fileName;
    let existingIcon;
    switch (true) {
      case /filled/.test(iconName): {
        fileName = 'filled.svg';
        iconName = iconName.replace('-filled', '');
        iconName = iconName.replace('-icon', '');
        existingIcon = `${inputPath}/${icon}/24dp.svg`;

        //if there is a filled add an iconrc file there
        // await fs.copy(
        //   `${outputPath}/iconrc.json`,
        //   `${outputPath}/${iconName}/iconrc.json`
        // );
        break;
      }
      case /large/.test(iconName): {
        fileName = 'default.svg';
        iconName = iconName.replace('-icon', '');
        //if there is a filled add an iconrc file there
        await fs.copy(
          `${outputPath}/iconrc.json`,
          `${outputPath}/${iconName}/iconrc.json`
        );
        existingIcon = `${inputPath}/${icon}/48dp.svg`;
        break;
      }
      default:
        fileName = 'default.svg';
        iconName = iconName.replace('-icon', '');
        iconName = iconName;
        existingIcon = `${inputPath}/${icon}/24dp.svg`;
        break;
    }
    const outputFile = `${outputPath}/${iconName}/${fileName}`;
    await fs.mkdirp(`${outputPath}/${iconName}`);
    if (fs.existsSync(existingIcon)) {
      console.log(`copying ${existingIcon} to ${outputFile}`);
      await fs.copy(existingIcon, `${outputPath}/${iconName}/${fileName}`);
    } else if (fs.existsSync(`${inputPath}/${icon}/16dp.svg`)) {
      await fs.copy(
        `${inputPath}/${icon}/16dp.svg`,
        `${outputPath}/${iconName}/${fileName}`
      );
    }
  }
}

export async function moveNav(inputPath: string, outputPath: string) {
  const icons = await getDirs(inputPath);
  for (const icon of icons) {
    let iconName = path.parse(icon).name;
    let fileName;
    switch (true) {
      case /inverse/.test(iconName): {
        fileName = 'inverse.svg';
        iconName = iconName.replace('-inverse', '');
        break;
      }
      case /filled/.test(iconName): {
        fileName = 'active.svg';
        iconName = iconName.replace('-filled', '');
        break;
      }
      case /outline/.test(iconName): {
        fileName = 'inactive.svg';
        iconName = iconName.replace('-outline', '');
        break;
      }
      default:
        fileName = 'active.svg';
        iconName = iconName;
        break;
    }
    const existingIcon = `${inputPath}/${icon}/32dp.svg`;
    if (fileName) {
      const outputFile = `${outputPath}/${iconName}/${fileName}`;
      await fs.mkdirp(`${outputPath}/${iconName}`);
      if (fs.existsSync(existingIcon)) {
        console.log(`copying ${existingIcon} to ${outputFile}`);
        await fs.copy(existingIcon, `${outputPath}/${iconName}/${fileName}`);
      } else {
        await fs.copy(
          `${inputPath}/${icon}/24dp.svg`,
          `${outputPath}/${iconName}/${fileName}`
        );
      }
    }
  }
}

async function getDirs(dir: string) {
  let dirs: string[] = [];
  for (const file of await fs.readdir(dir)) {
    if ((await fs.stat(path.join(dir, file))).isDirectory()) {
      dirs = [...dirs, file];
    }
  }
  return dirs;
}
