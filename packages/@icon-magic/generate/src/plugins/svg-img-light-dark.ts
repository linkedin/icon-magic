// /*
//  * This plugin will create a master svg with two child svg's.
//  * One dark and one light.
//  * The children svgs will have a `display` attribute that can be used to set
//  * which of the two svg's will be visible.
//  */

// import {
//   Flavor,
//   GeneratePlugin,
//   Icon
// } from '@icon-magic/icon-models';
// import * as fs from 'fs-extra';
// import * as path from 'path';
// import Svgo from 'svgo';
// import { DOMImplementation, DOMParser, XMLSerializer } from 'xmldom';

// const serializeToString = new XMLSerializer().serializeToString;

// export interface SvgLightDarkOptions {
//   lightToken?: string;
//   darkToken?: string;
// }

// export const svgLightDark: GeneratePlugin = {
//   name: 'svg-img-light-dark',
//   fn: async (
//     flavor: Flavor,
//     icon: Icon,
//     params: SvgLightDarkOptions = {},
//   ): Promise<Flavor> => {
//     // Get the output directory
//     const outputPath = icon.getIconOutputPath();
//     const imageSet = flavor.imageset;
//     const colorScheme = flavor.colorScheme;

//     /*
//     * If `imageSet` exists and the `colorScheme` equals `dark, run the plugin.
//     * Plugin will skip the `light` flavors because their data can be collected through the `dark` flavor
//     */
//     if (imageSet && colorScheme === 'dark') {
//       // light flavor data
//       const lightFlavor = icon.flavors.get(imageSet);

//       // if light flavor doesn't exist, exit out of plugin
//       if (!lightFlavor) {
//         return flavor;
//       }
//       const darkFlavorContents = (await flavor.getContents()) as string; // .svg asset's getContents() returns the svg as a string
//       const lightFlavorContents  = (await lightFlavor.getContents()) as string;

//       const { lightToken, darkToken } = params;

//       const lightSvgo = new Svgo({
//         plugins: [
//           {
//             addAttributesToSVGElement: {
//               attributes: [{display: lightToken ? `var(${lightToken})` : "var(--hue-web-svg-display-light)"}]
//             }
//           },
//           {
//             removeViewBox: false
//           }
//         ],
//         js2svg: { pretty: true, indent: 2 }
//       });

//       const darkSvgo = new Svgo({
//         plugins: [
//           {
//             addAttributesToSVGElement: {
//               attributes: [{display: darkToken ? `var(${darkToken})` : "var(--hue-web-svg-display-dark)"}]
//             }
//           },
//           {
//             removeViewBox: false
//           }
//         ],
//         js2svg: { pretty: true, indent: 2 }
//       });

//       if (lightFlavorContents) {
//         // create optimized light/dark svg assets
//         const lightAsset = await lightSvgo.optimize(lightFlavorContents); // .svg asset's getContents() returns a string
//         const darkAsset = await darkSvgo.optimize(darkFlavorContents);

//         const mixedParentSvg = await generateMixedSvgParent(lightAsset, darkAsset);

//         const mixedSvgo = new Svgo({
//           plugins: [
//             {
//               removeViewBox: false
//             }
//           ],
//           js2svg: { pretty: true, indent: 2 }
//         });

//         const mixedString = serializeToString(mixedParentSvg);
//         const mixedAsset = await mixedSvgo.optimize(mixedString);

//         // write the parent svg with light/dark children svg's to the output directory
//         await fs.ensureDir(outputPath);
//         await fs.writeFile(
//           path.format({dir: outputPath, name: `${imageSet}-mixed-image`, ext: '.svg'}),
//           mixedAsset.data,
//           {
//             encoding: 'utf8'
//           }
//         );

//         // Final new Mixed Flavor
//         const mixedFlavor: Flavor = new Flavor(icon.iconPath, {
//           name: `${imageSet}-mixed`,
//           path: `./${imageSet}-mixed.svg`,
//           colorScheme: 'mixed'
//         });

//         // Add new mixed flavor to icon.flavors. It is then added to resulting iconrc.json file.
//         icon.flavors.set(
//           `${imageSet}-mixed`,
//           mixedFlavor
//         );
//         return mixedFlavor;
//       }
//     }
//     return flavor;
//   }
// };

// // TODO: lightAsset type would be `OptimizedSvg` from Svgo interface, but it does not accept this type, looks like OptimizedSvg is not exported from Svgo.

// /**
//  * Takes two OptimizedSvg's from Svgo interface, adds them as children to a
//  * parent SVG Dom element and returns the Dom element
//  * @param lightAsset `OptimizedSvg` from Svgo interface
//  * @param darkAsset `OptimizedSvg` from Svgo interface
//  * @returns SVGSVGElement Dom elment with the two parameters as children.
//  */
// async function generateMixedSvgParent(lightAsset: any, darkAsset: any): Promise<SVGSVGElement> {
//   // Create SVG PARENT
//   const DOM = new DOMImplementation();
//   const doctype = DOM.createDocumentType(
//     'svg',
//     '-//W3C//DTD SVG 1.1//EN',
//     'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
//   );
//   const SVG_NS = 'http://www.w3.org/2000/svg';

//   // Create an SVG Document and set its doctype
//   const DOCUMENT = DOM.createDocument(SVG_NS, 'svg', doctype);

//   // Create SVG element
//   const svgEl = DOCUMENT.createElementNS(SVG_NS, 'svg');
//   svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

//   // Add <svg> element to SVG Document
//   DOCUMENT.appendChild(svgEl);

//   const svgLight = lightAsset.data;
//   const svgDark = darkAsset.data;

//   // Parse XML from a string into a DOM Document.
//   const doc = new DOMParser();
//   const xmlLight = doc.parseFromString(svgLight, 'image/svg+xml');
//   const xmlDark = doc.parseFromString(svgDark, 'image/svg+xml');

//   svgEl.setAttribute('width', xmlLight.documentElement.getAttribute('width') || '');
//   svgEl.setAttribute('height', xmlLight.documentElement.getAttribute('height') || '');
//   svgEl.setAttribute('viewBox', xmlLight.documentElement.getAttribute('viewBox') || '');

//   /*
//    * Append the root node of the DOM document to the parent element.
//    * Light is after Dark so that is the default CSS style in case the tokens fail for some reason
//   */

//   const darkEl = xmlDark.documentElement;
//   const lightEl = xmlLight.documentElement;

//   darkEl.removeAttribute('width');
//   darkEl.removeAttribute('height');
//   darkEl.removeAttribute('viewBox');
//   darkEl.removeAttribute('xmlns');

//   lightEl.removeAttribute('width');
//   lightEl.removeAttribute('height');
//   lightEl.removeAttribute('viewBox');
//   lightEl.removeAttribute('xmlns');

//   await svgEl.appendChild(darkEl);
//   await svgEl.appendChild(lightEl);

//   return svgEl;
// }

