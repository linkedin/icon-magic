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
  Asset,
  AssetSize,
  Flavor,
  GeneratePlugin,
  Icon
} from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';
import Svgo from 'svgo';

export interface SvgGenerateOptions {
  propCombo?: object;
  addSupportedDps?: 'all' | 'current' | 'none'; // when set to current, only adds the current size. If not, defaults to adding all allowed sizes
  isColored?: boolean; // if this is set, the fill of the icon isn't updated but respected
  isFixedDimensions?: boolean; // if this is true, then adds a width and height attribute to the svg (defaults to false) and no viewBox
  colorByNameMatching?: string[]; // if this is set to true, then set isColored only if the name of the flavor contains color in it
}

export const svgGenerate: GeneratePlugin = {
  name: 'svg-generate',
  fn: async (
    flavor: Flavor,
    icon: Icon,
    params?: SvgGenerateOptions
  ): Promise<Flavor> => {
    // build the attributes object that contains attributes to be added to the svg
    const attributes = { id: `${icon.iconName}-${flavor.name}` };
    let setCurrentColor = true; // by default, sets the colour of the icon to take the currentColor
    const flavorName: string = path.basename(flavor.name);

    if (params) {
      let dataSupportedDps;
      switch (params.addSupportedDps) {
        case 'current':
          // get the mapping object from the metadata
          const nameSizeMapping =
            icon.metadata && icon.metadata.nameSizeMapping;

          // if the metadata doesn't contain nameSizeMapping, throw an error
          if (!nameSizeMapping) {
            throw new Error(
              `SVGGenerateError: ${
                icon.iconPath
              } does not have the field "nameSizeMapping" as part of its config's "metadata". This is required since the config contains addSupportedDps: current`
            );
          }

          // get the size from the mapping that is passed in. This is a pattern
          // matching of the key and not necessarily the key itself
          let flavorSize;
          for (const key in nameSizeMapping) {
            if (flavorName.match(key)) flavorSize = nameSizeMapping[key];
          }

          if (!flavorSize) {
            throw new Error(
              `SVGGenerateError: ${flavorName} of ${
                icon.iconPath
              } does not match a key in "nameSizeMapping"`
            );
          }

          // format the size
          dataSupportedDps = getSupportedSizes([flavorSize]);
          break;
        case 'none':
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
    }

    const svgo = new Svgo({
      plugins: [
        {
          removeViewBox: (params && params.isFixedDimensions) || false
        },
        {
          removeDimensions: (params && !params.isFixedDimensions) || true
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
      ]
    });
    const asset = await svgo.optimize((await flavor.getContents()) as string); // .svg asset's getContents() returns a string
    const outputPath = icon.getIconOutputPath();

    // write the optimized svg to the output directory
    await fs.mkdirp(outputPath);
    await fs.writeFile(
      `${path.join(outputPath, flavor.name)}.svg`,
      asset.data,
      {
        encoding: 'utf8'
      }
    );

    // Create a new svg asset type and add it to the flavor
    flavor.types.set(
      'svg',
      new Asset(icon.iconPath, {
        name: flavor.name,
        path: `./${flavor.name}.svg`
      })
    );

    return flavor;
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
