/**
 * This plugin is used to optimize the SVG and add necessary fields to it
 * It uses svgo under the hood to
 * - remove all unwanted elements from the svg
 * - remove all previous ids, classes and attributes - including size attributes
 * - set the id of the node to be the name of the flavor
 * - set preserveAspectRatio="xMinYMin meet"
 * - add data-supported-dps to be all the sizes that the svg should/can be scaled to
 *   The icon will have a data-attribute that specifies the allowed sizes - in actual dp values
 *   eg: data-supported-dps="56x14 84x21 110x28 135x34 159x40 191x48"
 *       data-supported-dps="16 24"
 *   A helper function will need to map the API to the size and render the SVG with the appropriate width, height and viewbox values.
 * - colored/black - if it is a colored icon, then set style="fill: currentColor"
 */
 import {
  AssetSize,
  Flavor,
  GeneratePlugin,
  Icon,
  createHash
} from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';
import Svgo from 'svgo';

/**
 * Decides what sizes to append for data-supported-dps
 * all - adds all the sizes that the icon can have
 * current - only adds the current size. If not, defaults to adding all allowed sizes
 * none - does not add the attribute at all
 */
enum AddSupportedDpsValues {
  ALL = 'all',
  CURRENT = 'current',
  NONE = 'none'
}

export interface SvgGenerateOptions {
  propCombo?: object;
  addSupportedDps?: AddSupportedDpsValues;
  /* if this is set, the fill of the icon isn't updated but respected */
  isColored?: boolean;
  /* if this is true, then adds a width and height attribute to the svg
  (defaults to false) and no viewBox */
  isFixedDimensions?: boolean;
  /* if this is set to true, then set isColored only if the name of the flavor
  contains color in it */
  colorByNameMatching?: string[];
  classNames?: string[];
}

export const svgGenerate: GeneratePlugin = {
  name: 'svg-generate',
  fn: async (
    flavor: Flavor,
    icon: Icon,
    params: SvgGenerateOptions = {}
  ): Promise<Flavor> => {
    const flavorContent = (await flavor.getContents()) as string; // .svg asset's getContents() returns a string
    const flavorName: string = path.basename(flavor.name);

    // Create the output directory
    const outputPath = icon.getIconOutputPath();

    // If generate hasn't been run create the hash
    flavor.generateSourceHash = createHash(flavorContent);
    // build the attributes object that contains attributes to be added to the svg
    const attributes = { id: `${icon.iconName}-${flavor.name}`, 'aria-hidden': true, 'role': 'none'};
    let setCurrentColor = true; // by default, sets the colour of the icon to take the currentColor

    const rtlFlip = icon.metadata && icon.metadata.rtlFlip;

    const classNames = params.classNames || [];

    if (rtlFlip && classNames.indexOf("rtl-flip") === -1) {
      classNames.push("rtl-flip");
    }

    let dataSupportedDps;
    switch (params.addSupportedDps) {
      case AddSupportedDpsValues.CURRENT:
        // get the mapping object from the metadata
        const nameSizeMapping = icon.metadata && icon.metadata.nameSizeMapping;

        // if the metadata doesn't contain nameSizeMapping, throw an error
        if (!nameSizeMapping) {
          throw new Error(
            `SVGGenerateError: ${icon.iconPath} does not have the field "nameSizeMapping" as part of its config's "metadata". This is required since the config contains addSupportedDps: current`
          );
        }

        // get the size from the mapping that is passed in. This is a pattern
        // matching of the key and not necessarily the key itself
        // once a pattern is matched, we check to see if it's the longest
        // matching key to ensure that the correct size is obtained from the name
        let flavorSize;
        let matchedLength = 0;
        for (const key in nameSizeMapping) {
          const regExMatch = flavorName.match(key);
          if (regExMatch && matchedLength < regExMatch[0].length) {
            matchedLength = regExMatch[0].length;
            flavorSize = nameSizeMapping[key];
          }
        }

        if (!flavorSize) {
          throw new Error(
            `SVGGenerateError: ${flavorName} of ${icon.iconPath} does not match a key in "nameSizeMapping"`
          );
        }

        // format the size
        dataSupportedDps = getSupportedSizes([flavorSize]);
        break;
      case AddSupportedDpsValues.NONE:
        break; // do nothing
      default:
        // also 'all'
        dataSupportedDps = getSupportedSizes(icon.sizes);
    }
    // set the attribute only if it's present
    if (dataSupportedDps) {
      attributes['data-supported-dps'] = dataSupportedDps;
    }

    // set the fill to be currentColor
    if (params.colorByNameMatching) {
      const nameMatching = flavorName.match(
        new RegExp(params.colorByNameMatching.join('|'), 'gi')
      );
      setCurrentColor =
        nameMatching && nameMatching.length > 0 ? false : setCurrentColor; // if the name does not contain the words specified, then setCurrentcolor
    }
    // if isColored is set on the icon, then respect it
    if (params.isColored) {
      setCurrentColor = !params.isColored;
    }

    if (setCurrentColor) {
      attributes['fill'] = 'currentColor';
    }

    const svgoPlugins: Svgo.PluginConfig[] = [
      {
        removeViewBox: false
      },
      {
        cleanupIDs: {
          prefix: `${icon.category}-${attributes.id}-`
        }
      },
      {
        removeDimensions: !params.isFixedDimensions
      },
      {
        convertColors: {
          currentColor: setCurrentColor ? true : false // this also converts fills within the svg paths
        }
      },
      {
        removeAttrs: { attrs: '(data.*)' }
      },
      {
        addAttributesToSVGElement: {
          attributes: [attributes]
        }
      },
      { removeRasterImages: true }
    ];

    if (classNames.length) {
      svgoPlugins.push({
        addClassesToSVGElement: {
          className: classNames
        }
      });
    }

    const svgo = new Svgo({
      plugins: svgoPlugins,
      js2svg: { pretty: true, indent: 2 }
    });

    // write the optimized svg to the output directory
    const asset = await svgo.optimize(flavorContent); // .svg asset's getContents() returns a string
    await fs.mkdirp(outputPath);

    await fs.writeFile(
      `${path.join(outputPath, flavor.name)}.svg`,
      asset.data,
      {
        encoding: 'utf8'
      }
    );

    // Final new flavor generated flavor
    const generatedFlavor: Flavor = new Flavor(icon.iconPath, {
      name: `${flavor.name}`,
      path: `./${flavor.name}.svg`,
      colorScheme: flavor.colorScheme,
      imageset: flavor.imageset,
      buildSourceHash: flavor.buildSourceHash,
      generateSourceHash: flavor.generateSourceHash
    });

    generatedFlavor.types.set('svg', generatedFlavor);

    // Add new the flavor to icon.flavors. It is then added to resulting
    // iconrc.json file.

    icon.flavors.set(
      `${flavor.name}`,
      generatedFlavor
    );

    return generatedFlavor;
  }
};

/**
 * Converts the set of sizes from asset sizes to string values of the form:
 * (width x height)
 * @param sizes Array of icon asset sizes
 */
function getSupportedSizes(sizes: AssetSize[]): String {
  return sizes
    .map(size => {
      return typeof size === 'number'
        ? `${size}x${size}`
        : `${size.width}x${size.height}`;
    })
    .join(' ');
}
