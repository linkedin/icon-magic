/*
 * This plugin replaces the svg's contents with an image referencing a remote URL
 */

import {
  Flavor,
  GeneratePlugin,
  Icon
} from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DOMParser, XMLSerializer } from 'xmldom';

const serializeToString = new XMLSerializer().serializeToString;
export interface SvgImageOptions {
  pathToTheImageAsset?: string;
}

export const svgWithImage: GeneratePlugin = {
  name: 'svg-with-image',
  fn: async (
    flavor: Flavor,
    icon: Icon,
    params: SvgImageOptions = {},
  ): Promise<Flavor> => {

    if (!params.pathToTheImageAsset) {
      throw new Error(`SVGImageError: ${icon.iconPath}'s iconrc.json does not contain pathToTheImageAsset in the distribute plugin`);
    }

    const flavorContents = (await flavor.getContents()) as string;

    // Parse XML from a string into a DOM Document.
    const doc = new DOMParser();

    const xmlFlavorDoc = doc.parseFromString(flavorContents, 'image/svg+xml');

    const xmlFlavorEl = xmlFlavorDoc.documentElement;

    // Create an empty clone of the outer SVG
    const svgWithImg = xmlFlavorEl.cloneNode(false);

    // create the image node
    const imageNode  = xmlFlavorDoc.createElement('image');
    imageNode.setAttribute('href', path.format({dir: path.join(params.pathToTheImageAsset, icon.iconName), name: flavor.name, ext: '.svg'}));
    // blank alt text is needed so this doesn't call out an error with screen
    // readers
    imageNode.setAttribute('alt', '');

    // add it to the original svg wrapper
    svgWithImg.appendChild(imageNode);

    const outputPath = icon.getIconOutputPath();

    await fs.mkdirp(outputPath);

    await fs.writeFile(
      path.format({dir: outputPath, name: `${flavor.name}-with-image`, ext: '.svg'}),
      serializeToString(svgWithImg),
      {
        encoding: 'utf8'
      }
    );

    // Final new flavor with image
    const withImageFlavor: Flavor = new Flavor(icon.iconPath, {
      name: `${flavor.name}-with-image`,
      path: `./${flavor.name}-with-image.svg`,
      colorScheme: flavor.colorScheme || undefined,
      imageset: flavor.imageset ? `${flavor.imageset}-with-image` : undefined
    });

    withImageFlavor.types.set('svg', withImageFlavor);

    // Add new the flavor to icon.flavors. It is then added to resulting iconrc.json file.
    icon.flavors.set(
      `${flavor.name}-with-image`,
      withImageFlavor
    );

    return withImageFlavor;
  }
};

