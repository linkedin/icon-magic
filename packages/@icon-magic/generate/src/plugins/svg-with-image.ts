/*
 * This plugin replaces the svg's contents with an image referencing a remote URL
 */

import {
  Asset,
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

    let xmlFlavorEl = xmlFlavorDoc.documentElement;

    // remove all the child nodes from this element
    while (xmlFlavorEl.firstChild) {
      //The list is LIVE so it will re-index each call
      xmlFlavorEl.removeChild(xmlFlavorEl.firstChild);
    }

    // create the image node
    let imageNode  = xmlFlavorDoc.createElement('image');
    imageNode.setAttribute('href', path.format({dir: path.join(params.pathToTheImageAsset, icon.iconName), name: flavor.name, ext: '.svg'}));
    // blank alt text is needed so this doesn't call out an error with screen
    // readers
    imageNode.setAttribute('alt', '');

    // add it to the original svg wrapper
    xmlFlavorEl.appendChild(imageNode);

    // Create a new svg asset type and add it to the flavor
    flavor.types.set(
      'svgWithImage',
      new Asset(icon.iconPath, {
        name: flavor.name,
        path: `./${flavor.name}-with-image.svg`,
        imageset: flavor.imageset,
        colorScheme: flavor.colorScheme,
        sizes: flavor.sizes
      })
    );

    const outputPath = icon.getIconOutputPath();

    await fs.mkdirp(outputPath);

    await fs.writeFile(
      path.format({dir: outputPath, name: `${flavor.name}-with-image`, ext: '.svg'}),
      serializeToString(xmlFlavorEl),
      {
        encoding: 'utf8'
      }
    );

    return flavor;
  }
};

