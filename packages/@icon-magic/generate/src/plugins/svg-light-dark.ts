/*
 * This plugin will create a master SVG with two child SVGs -
 * one dark and one light.
 * The children SVGs will have a `display` attribute that can be used to set
 * which of the two svg's will be visible.
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
    // Get the output directory
    const outputPath = icon.getIconOutputPath();
    const imageset = flavor.imageset;
    const colorScheme = flavor.colorScheme;

    /*
    * If `imageset` exists and the `colorScheme` equals `dark, run the plugin.
    * Plugin will skip the `light` flavors because their data can be collected through the `dark` flavor
    */
    if (imageset && colorScheme === 'dark') {
      // light flavor data
      const lightFlavor = icon.flavors.get(imageset);

      // if light flavor doesn't exist, exit out of plugin
      if (!lightFlavor) {
        return flavor;
      }

      const svgDark = (await flavor.getContents()) as string; // .svg asset's getContents() returns the svg as a string
      const svgLight  = (await lightFlavor.getContents()) as string;

      if (svgLight) {
        // create optimized light/dark svg assets

        // Parse XML from a string into a DOM Document.
        const doc = new DOMParser();
        const xmlLight = doc.parseFromString(svgLight, 'image/svg+xml');
        const xmlDark = doc.parseFromString(svgDark, 'image/svg+xml');

        const darkEl = xmlDark.documentElement;
        const lightEl = xmlLight.documentElement;

        // clone the outer element of the svg
        const wrapperEl = lightEl.cloneNode(false);

        // Remove all attributes from the light and dark elements
        while (darkEl.attributes.length) {
          darkEl.removeAttribute(darkEl.attributes[0].name);
        }
        while (lightEl.attributes.length) {
          lightEl.removeAttribute(lightEl.attributes[0].name);
        }

        // set the appropriate display tokens for light and dark displays
        const { lightToken, darkToken } = params;
        darkEl.setAttribute('display', (darkToken? `var(${darkToken})` : `var(--svg-display-dark)`));
        lightEl.setAttribute('display', (lightToken? `var(${lightToken})` : `var(--svg-display-light)`));

        // append to the wrapper SVG
        wrapperEl.appendChild(darkEl);
        wrapperEl.appendChild(lightEl);

        // write the parent svg with light/dark children svg's to the output directory
        await fs.ensureDir(outputPath);
        await fs.writeFile(
          path.format({dir: outputPath, name: `${imageset}-mixed`, ext: '.svg'}),
          serializeToString(wrapperEl),
          {
            encoding: 'utf8'
          }
        );

        // Final new Mixed Flavor
        const mixedFlavor: Flavor = new Flavor(icon.iconPath, {
          name: `${imageset}-mixed`,
          path: `./${imageset}-mixed.svg`,
          colorScheme: 'mixed',
          imageset: flavor.imageset
        });

        mixedFlavor.types.set('svg', mixedFlavor);

        // Add new mixed flavor to icon.flavors. It is then added to resulting iconrc.json file.
        icon.flavors.set(
          `${imageset}-mixed`,
          mixedFlavor
        );
        return mixedFlavor;
      }
    }
    // do nothing and return the original flavor
    return flavor;
  }
};
