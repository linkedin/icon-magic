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

import * as fs from 'fs-extra';
import * as path from 'path';
import Svgo from 'svgo';
import { Icon, Flavor, GeneratePlugin, Asset } from '@icon-magic/icon-models';

// TODO: check if we should add more properties here
export interface SvgGenerateOptions {
  propCombo: object;
  addSupportedDps?: boolean;
  isColoredIcon?: boolean;
  setSize?: boolean;
  setViewbox?: boolean;
}

export const svgGenerate: GeneratePlugin = {
  name: 'svg-generate',
  fn: async (flavor: Flavor, icon: Icon, _params?: object): Promise<Flavor> => {
    let svgo = new Svgo();
    let asset = await svgo.optimize(flavor.contents as string);
    let outputPath = icon.generateOutputPath;

    // write the optimized svg to the output directory
    await fs.mkdirp(outputPath);
    await fs.writeFile(`${path.join(outputPath, flavor.name)}.svg`, asset, {
      encoding: 'utf8'
    });

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
