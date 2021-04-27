import {
  AssetResolution,
  AssetSize,
  Flavor,
  GeneratePlugin,
  Icon,
  createHash
} from '@icon-magic/icon-models';
import { minify } from '@icon-magic/imagemin-farm';
import { Logger, logger } from '@icon-magic/logger';
import { convert } from '@icon-magic/svg-to-png';
import * as fs from 'fs-extra';
import * as path from 'path';

const webp = require('webp-converter');
const LOGGER: Logger = logger('icon-magic:generate:svg-to-raster');

/**
 * Optional values passed into the svg-to-raster plugin
 */
export interface SvgToRasterOptions {
  useResolutionValueFromName?: Boolean;
  /** if this is set to true, the plugin uses the size for the icon from a
   * metadata field called nameSizeMapping in the config to determine the size
   * of the icon */
  useNameSizeMapping?: boolean;
  /** Data coming in from the plugin-manager (specified as iterants in the
   * plugins config) */
  propCombo?: {
    sizes?: AssetSize;
    resolutions?: AssetResolution;
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
    params: SvgToRasterOptions = {}
  ): Promise<Flavor> => {
    // get the size and resolution from the params passed in
    if (params.propCombo) {
      let w: number;
      let h: number;
      // if a nameSizeMapping should be used, get the size from the matching
      // name pattern
      if (params.useNameSizeMapping) {
        const nameSizeMapping = icon.metadata && icon.metadata.nameSizeMapping;
        // throw an error if the icon's config file does not have metadata
        // information for nameSizeMapping
        if (!nameSizeMapping) {
          throw new Error(
            `${icon.iconPath} does not have the field "nameSizeMapping" as part of its config's "metadata". This is required since the config contains useNameSizeMapping: true`
          );
        }
        let sizeFromMapping!: AssetSize;
        const flavorName = path.basename(flavor.name);

        // get the size from the mapping that is passed in. This is a pattern
        // matching of the key and not necessarily the key itself
        // once a pattern is matched, we check to see if it's the longest
        // matching key to ensure that the correct size is obtained from the name
        let matchedLength = 0;
        for (const key in nameSizeMapping) {
          const regExMatch = flavorName.match(key);
          if (regExMatch && matchedLength < regExMatch[0].length) {
            matchedLength = regExMatch[0].length;
            sizeFromMapping = nameSizeMapping[key];
          }
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

      // If resolution is not passed in (the iterant is not set in the config),
      // the plugin assumes res = 1 and renames the flavor such that the
      // resolution is at the end of the flavor's name Eg: if flavor.name =
      // home-filled@12 then the resulting name will be
      // home-filled-width-height@12 instead of home-filled@12-width-height
      let res;
      let assetName: string;
      const flavorName = flavor.name;

      if (!params.propCombo.resolutions) {
        res = 1;
        const resolutionFromName = flavorName.match(/@[0-9|\.]*/);
        if (resolutionFromName) {
          // strip the resolution from the flavor's name and append it to the end
          const nameWithoutRes = `${flavorName.replace(
            resolutionFromName[0],
            ''
          )}`;
          // don't append `-` if there's name is an empty string
          assetName = `${appendDash(nameWithoutRes)}${w}x${h}${
            resolutionFromName[0]
          }`;
          LOGGER.debug(`resolutionFromName: ${resolutionFromName}`);
          // the resolution is of the form @1 in the name and we need to get the
          // number for raster generation
          res = parseFloat(resolutionFromName[0].replace('@', ''));
        } else {
          // appends @1 to the name
          // name is an optional property on flavor, so don't append `-` if there's nothing
          assetName = `${appendDash(flavorName)}${w}x${h}@${res}`;
        }
      } else {
        res = params.propCombo.resolutions;
        assetName = `${appendDash(flavorName)}${w}x${h}@${res}`;
      }

      // Get icon output path
      const outputPath = icon.getIconOutputPath();

      // create the icon output path if it doesn't exist already
      await fs.mkdirp(outputPath);
      // First, we generate the png and store it in the output directory
      const pngOutput = `${path.join(outputPath, assetName)}.png`;
      LOGGER.debug(`Creating ${pngOutput}`);
      const flavorContent = (await flavor.getContents()) as string; // .svg asset's getContents() returns a string
      await generatePng(flavorContent, w * res, h * res, pngOutput);

      // Convert the png to webp
      LOGGER.debug(`Creating webp from ${pngOutput} `);
      await convertToWebp(
        pngOutput,
        `${path.join(outputPath, assetName)}.webp`
      );

      // minify the png. webp minification doesn't help
      LOGGER.debug(`Minifying png: ${pngOutput}`);
      await minify(pngOutput);

      let imageset;
      if (flavor.imageset) {
        imageset = `${appendDash(flavor.imageset)}${w}x${h}`;
      }

      // create a new flavor with this sizexresolution combination
      const flavorWithRasterAssets: Flavor = new Flavor(icon.iconPath, {
        name: assetName,
        path: flavor.getPath(),
        generateSourceHash: createHash(flavorContent),
        types: {
          png: {
            name: assetName,
            path: `./${assetName}.png`,
            imageset: imageset
          },
          webp: {
            name: assetName,
            path: `./${assetName}.webp`,
            imageset: imageset
          }
        }
      });
      return flavorWithRasterAssets;
    }
    return flavor;
  }
};

/**
 * Appends dash to a string if it's not empty
 * @param s the string to append a dash to
 * @returns empty string or string with appended dash
 */
function appendDash(s: string): string {
  return s ? `${s}-` : s;
}

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
    webp.cwebp(pathToPng, outputPath, '-m 6 -z 9', function(status: string) {
      !!~status.indexOf('100') ? resolve(outputPath) : reject();
    });
  });
}
