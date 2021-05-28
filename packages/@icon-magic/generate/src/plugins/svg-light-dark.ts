/*
- This plugin will create a master svg with two child svg's.
- One dark and one light.
- The children svgs will have a `display` attribute that can be used to set
which of the two svg's will be visible. */

import {
  Flavor,
  GeneratePlugin,
  Icon
} from '@icon-magic/icon-models';
import * as fs from 'fs-extra';
import * as path from 'path';
import Svgo from 'svgo';
import { DOMImplementation, DOMParser } from 'xmldom';


export interface SvgLightDarkOptions {
  lightToken?: string;
  darkToken?: string;
}

export const svgLightDark: GeneratePlugin = {
  name: 'svg-light-dark',
  fn: async (
    flavor: Flavor,
    icon: Icon,
    params: SvgLightDarkOptions = {},
  ): Promise<Flavor> => {
    // Create the output directory
    const outputPath = icon.getIconOutputPath();
    const imageSet = flavor.imageset;


    // Only dark flavors have an imageSet Attribute
    // If imageSet exists, plugin will run (on the "dark" flavor only)
    // plugin will skip the "light" flavors because their data can be gotten
    // with the dark flavor
    if (imageSet) {
      const darkFlavorContents = (await flavor.getContents()) as string; // .svg asset's getContents() returns a string (the svg as a string)
      const lightFlavor = icon.flavors.get(imageSet);
      let lightFlavorContents;
      if (lightFlavor) {
        lightFlavorContents = (await lightFlavor.getContents()) as string;

      }

    const lightToken = params.lightToken;
    const darkToken = params.darkToken;


    const lightSvgo = new Svgo({
      plugins: [
        {
          addAttributesToSVGElement: {
            attributes: [{display: lightToken || "var(--svg-light-display)"}]
          }
        }
      ],
      js2svg: { pretty: true, indent: 2 }
    });

    const darkSvgo = new Svgo({
      plugins: [
        {
          addAttributesToSVGElement: {
            attributes: [{display: darkToken || "var(--svg-dark-display)"}]
          }
        }
      ],
      js2svg: { pretty: true, indent: 2 }
    });

      if (lightFlavorContents){
        // create optimized light/dark svg assets
        const lightAsset = await lightSvgo.optimize(lightFlavorContents); //returns a string
        const darkAsset = await darkSvgo.optimize(darkFlavorContents);

        // Create SVG PARENT
        const DOM = new DOMImplementation();
        const doctype = DOM.createDocumentType(
          'svg',
          '-//W3C//DTD SVG 1.1//EN',
          'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
        );
        const SVG_NS = 'http://www.w3.org/2000/svg';

        // Create an SVG Document and set its doctype
        const DOCUMENT = DOM.createDocument(SVG_NS, 'svg', doctype);

        // Create SVG element
        const svgEl = DOCUMENT.createElementNS(SVG_NS, 'svg');
        svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        svgEl.setAttribute('version', '1.1');

        // Add <svg> element to SVG Document
        DOCUMENT.appendChild(svgEl);

        let svgLight = lightAsset.data;
        let svgDark = darkAsset.data;

        // Parse XML from a string into a DOM Document.
        const doc = new DOMParser();
        const xmlLight = doc.parseFromString(svgLight as string, 'image/svg+xml');
        const xmlDark = doc.parseFromString(svgDark as string, 'image/svg+xml');

        svgEl.setAttribute('width', xmlLight.documentElement.getAttribute('width') || '');
        svgEl.setAttribute('height', xmlLight.documentElement.getAttribute('height') || '');
        svgEl.setAttribute('viewBox', xmlLight.documentElement.getAttribute('viewBox') || '');

        // Append the root node of the DOM document to the parent element
        await svgEl.appendChild(xmlLight.documentElement);
        await svgEl.appendChild(xmlDark.documentElement);

        // write the parent svg with light/dark children svg's to the output directory
        await fs.ensureDir(outputPath);
        await fs.writeFile(
          `${path.join(outputPath, imageSet)}-mixed.svg`,
          svgEl,
          {
            encoding: 'utf8'
          }
        );
      }
    }
    return flavor;
  }
};
