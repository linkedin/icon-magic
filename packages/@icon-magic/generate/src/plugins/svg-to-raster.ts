import { Flavor, GeneratePlugin, Icon } from '@icon-magic/icon-models';
import { minify } from '@icon-magic/imagemin-farm';
import { convertToPng, convertToWebp } from '@icon-magic/svg-to-png';
import * as debugGenerator from 'debug';
import * as fs from 'fs-extra';
import * as path from 'path';

const debug = debugGenerator('icon-magic:generate:svg-to-raster');

// TODO: typescript check how to specify this interface for params when the
// plugin interface takes in object
// export type SvgToRasterOptions = {
//   propCombo: {
//     sizes: AssetSize;
//     resolutions: AssetResolution;
//   } & {
//     [prop: string]: any;
//   };
// };

/**
 * This plugin converts and .svg image to .webp and .png images by going over
 * the size and resolution attributes of the icon
 *
 * The resulting raster assets are further minified and written to the generate
 * output directory. The assets are also added to the flavor as different types
 * on the flavor itself
 *
 * This plugin does not return any content as part of the flavor as it
 * automatically writes the output to the output directory. This should not
 * break the plugin chain as a Flavor is returned, just that the content of the
 * types are empty
 */
export const svgToRaster: GeneratePlugin = {
  name: 'svg-to-raster',
  iterants: ['sizes', 'resolutions'],
  fn: async (flavor: Flavor, icon: Icon, params?: any): Promise<Flavor> => {
    // get the size and resolution from the params passed in
    if (params && params.propCombo) {
      const w = params.propCombo.sizes.width || params.propCombo.sizes;
      const h = params.propCombo.sizes.height || params.propCombo.sizes;
      const res = params.propCombo.resolutions;

      // get the generateOutputPath from the icon and make it if it doesn't exist
      // alraedy
      const outputPath = icon.getOutputPath();
      await fs.mkdirp(outputPath);

      const realSize = `${w * res}x${h * res}`;
      const assetName = `${flavor.name}-${realSize}`;

      // First, we generate the png and store it in the output directory
      const pngOutput = `${path.join(outputPath, assetName)}.png`;
      debug(`Creating ${pngOutput}`);
      await generatePng(
        flavor.contents as string, // svg is always in a string format
        w * res,
        h * res,
        pngOutput
      );

      // Convert the png to webp
      debug(`Creating ${pngOutput} webp`);
      const webpOut = `${path.join(outputPath, assetName)}.webp`;
      await generateWebp(
        flavor.contents as string, // svg is always in a string format
        webpOut
      );

      // minify both the png and webp assets
      debug(`Minifying ${pngOutput} and .webp`);
      await Promise.all([minify(pngOutput), minify(webpOut)]);

      // create a new flavor with this sizexresolution combination
      const flavorWithRasterAssets: Flavor = new Flavor(icon.iconPath, {
        name: assetName,
        path: `./${flavor.name}.svg`,
        types: {
          png: {
            name: assetName,
            path: `./${assetName}.png`
          },
          webp: {
            name: assetName,
            path: `./${assetName}.webp`
          }
        }
      });
      return flavorWithRasterAssets;
    }
  }
};

/**
 * Generate a png asset from an svg string
 * @param svg the contents of an svg file that needs to be converted to png
 * @param width width of the output png
 * @param height height of the output png
 * @param outputPath path to write the png file after it's created
 */
async function generatePng(
  svg: string,
  width: number,
  height: number,
  outputPath: string
): Promise<void> {
  await convertToPng(svg, { width, height }, outputPath);
}


/**
 * Generate a webp asset from an svg string
 * @param svg the contents of an svg file that needs to be converted to png
 * @param outputPath path to write the webp file after it's created
 */
async function generateWebp(
  svg: string,
  outputPath: string
): Promise<void> {
  await convertToWebp(svg, outputPath);
}