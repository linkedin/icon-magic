import {
  AssetResolution,
  AssetSize,
  Flavor,
  GeneratePlugin,
  Icon
} from '@icon-magic/icon-models';
import { minify } from '@icon-magic/imagemin-farm';
import { Logger, logger } from '@icon-magic/logger';
import { convert } from '@icon-magic/svg-to-png';
import * as fs from 'fs-extra';
import * as path from 'path';

const webp = require('webp-converter');
const LOGGER: Logger = logger('icon-magic:generate:svg-to-raster');

export interface SvgToRasterOptions {
  useNameSizeMapping?: boolean;
  propCombo?: {
    sizes?: AssetSize;
    resolutions: AssetResolution;
  };
}

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
  fn: async (
    flavor: Flavor,
    icon: Icon,
    params?: SvgToRasterOptions
  ): Promise<Flavor> => {
    // get the size and resolution from the params passed in
    if (params && params.propCombo) {
      let w: number;
      let h: number;
      // if a nameSizeMapping should be used, get the size from the matching name pattern
      if (params.useNameSizeMapping) {
        const nameSizeMapping: { [name: string]: AssetSize } =
          icon.metadata && icon.metadata.nameSizeMapping;
        // throw an error if the icon's config file does not have metadata
        // information for nameSizeMapping
        if (!nameSizeMapping) {
          throw new Error(
            `${
              icon.iconPath
            } does not have the field "nameSizeMapping" as part of its config's "metadata". This is required since the config contains useNameSizeMapping: true`
          );
        }
        let sizeFromMapping!: AssetSize;
        const flavorName = path.basename(flavor.name);

        // get the size from the mapping that is passed in. This is a pattern
        // matching of the key and not necessarily the key itself
        for (const key in nameSizeMapping) {
          if (flavorName.match(key)) sizeFromMapping = nameSizeMapping[key];
        }

        if (sizeFromMapping) {
          w =
            typeof sizeFromMapping === 'number'
              ? sizeFromMapping
              : sizeFromMapping.width;
          h =
            typeof sizeFromMapping === 'number'
              ? sizeFromMapping
              : sizeFromMapping.height;
        } else {
          throw new Error(
            `${flavorName} does not match a size in ${nameSizeMapping}`
          );
        }
      } else {
        if (!params.propCombo.sizes) {
          throw new Error(
            `svg-to-raster: 'sizes' has to be set for ${flavor.name} `
          );
        }
        w =
          typeof params.propCombo.sizes === 'number'
            ? params.propCombo.sizes
            : params.propCombo.sizes.width;
        h =
          typeof params.propCombo.sizes === 'number'
            ? params.propCombo.sizes
            : params.propCombo.sizes.height;
      }
      const res = params.propCombo.resolutions;

      // create the icon output path if it doesn't exist already
      const outputPath = icon.getIconOutputPath();
      await fs.mkdirp(outputPath);

      const assetName = `${flavor.name}-${w}x${h}@${res}`;

      // First, we generate the png and store it in the output directory
      const pngOutput = `${path.join(outputPath, assetName)}.png`;
      LOGGER.debug(`Creating ${pngOutput}`);
      await generatePng(
        (await flavor.getContents()) as string, // .svg asset's getContents() returns a string
        w * res,
        h * res,
        pngOutput
      );

      // Convert the png to webp
      LOGGER.debug(`Creating webp from ${pngOutput} `);
      await convertToWebp(
        pngOutput,
        `${path.join(outputPath, assetName)}.webp`
      );

      // minify the png. webp minification doesn't help
      LOGGER.debug(`Minifying png: ${pngOutput}`);
      await minify(pngOutput);

      // create a new flavor with this sizexresolution combination
      const flavorWithRasterAssets: Flavor = new Flavor(icon.iconPath, {
        name: assetName,
        path: flavor.getPath(),
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
    return flavor;
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
  const png = await convert(svg, { width, height });
  await fs.writeFile(outputPath, png);
}

/**
 * Converts a png file to webp and writes to the outputPath
 * @param input path to the input file in .png format
 * @param outputPath path where the output needs to go
 */
function convertToWebp(pathToPng: string, outputPath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    webp.cwebp(pathToPng, outputPath, '-q 80', function(status: string) {
      !!~status.indexOf('100') ? resolve(outputPath) : reject();
    });
  });
}
