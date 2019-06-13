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

// TODO: check if we should add more properties here
export interface SvgGenerateOptions {
  propCombo?: object;
  addSupportedDps?: 'all' | 'current' | 'none'; // when set to current, only adds the current size. If not, defaults to adding all allowed sizes
  isColoredIcon?: boolean; // if this is set, the fill of the icon isn't updated but respected
  removeDimensions?: boolean; // if this is true, then adds a width and height attribute to the svg (defaults to true)
  removeViewbox?: boolean; // if this is true, then retains the viewBox of the original svg (defaults to false)
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
              `${
                icon.iconPath
              } does not have the field "nameSizeMapping" as part of its config's "metadata". This is required since the config contains addSupportedDps: current`
            );
          }

          // get the size from the mapping
          const flavorName: string = path.basename(flavor.name);
          const flavorSize: AssetSize = nameSizeMapping[flavorName];
          if (!flavorSize) {
            throw new Error(
              `${
                icon.iconPath
              } does not have the field "nameSizeMapping" as part of its config's "metadata". This is required since the config contains addSupportedDps: current`
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
      attributes['data-supported-dps'] = dataSupportedDps;

      if (!params.isColoredIcon) {
        attributes['fill'] = 'currentColor';
      }
    }

    const svgo = new Svgo({
      plugins: [
        {
          removeViewBox: (params && params.removeViewbox) || false
        },
        {
          removeDimensions: (params && params.removeDimensions) || true
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
