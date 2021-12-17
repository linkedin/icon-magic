/**
 * This plugin converts .svg to .js that contain HTML Custom Element
 * to render the given SVG on a web page.
 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements
 *
 * The resulting assets define and register custom elements to CustomElementRegistry
 * via window.customElements.
 *
 * The input of this plugin is the svg to be converted to custom element.
 * The plugin returns the asset flavor with added custom element asset type and
 * automatically writes the output (javascript files) to the output directory.
 */
import {
  Asset,
  Flavor,
  GeneratePlugin,
  Icon,
} from '@icon-magic/icon-models';
import { Logger } from '@icon-magic/logger';
import * as fs from 'fs-extra';
import * as path from 'path';

import { kebabToCamel, stripSpacesBetweenTags } from '../utils';

const LOGGER = new Logger('icon-magic:generate:svg-to-custom-element');
const CUSTOM_ELEMENT_NAME_PREFIX = 'icon-magic-';

/**
 * Get javascript file contents for creating custom element
 * @param elName - name of the custom element
 * @param svgData - svg to render on a web page
 */
const getFileContent = (elName: string, svgData: string): string => {
  const elNameInCamelCase = kebabToCamel(elName);
  return `/**
 * Auto-generated by @icon-magic plugin
 * https://github.com/linkedin/icon-magic
 *
 * Usage:
 *
 * JS
 * import ${elNameInCamelCase} './${elName}';
 * ${elNameInCamelCase}();
 *
 * HTML
 * <${elName}></${elName}>
 */
export default function () {
  // Can't register the same tag more than once. Throws DOMException.
  if (window && !window.customElements.get('${elName}')) {
    window.customElements.define(
      '${elName}',
      class extends HTMLElement {
        // when the element is inserted into DOM
        connectedCallback() {
          this.innerHTML = '${svgData}';
        }
      }
    );
  }
}
`;
};

export interface CustomElementGenerateOptions {
  namePrefix?: string;
}

export const svgToCustomElement: GeneratePlugin = {
  name: 'svg-to-custom-element',
  fn: async (
    flavor: Flavor,
    icon: Icon,
    params: CustomElementGenerateOptions = {}
  ): Promise<Flavor> => {
    // Get svg flavor
    const svgFlavor = flavor.types.get('svg');
    if (svgFlavor === undefined) {
      return flavor;
    }
    // Get contents of svg asset as a string
    let svgData = (await svgFlavor.getContents()) as string;
    svgData = stripSpacesBetweenTags(svgData);
    // Create the output directory
    const outputPath = icon.getIconOutputPath();

    /* IMPORTANT
      - We need unique prefix to prevent collisions
        because custom elements are globally declared within the webpage.
      - The name must contain a dash (-) for HTML parser to distinguish
        custom elements from regular elements.
      - Custom elements cannot be self-closing.
    */
    const prefix = params.namePrefix || CUSTOM_ELEMENT_NAME_PREFIX;
    const flavorName = path.basename(flavor.name);
    const customElementName = `${prefix}${icon.iconName}-${flavorName}`;
    const fileContent = getFileContent(customElementName, svgData);
    const filePath = `${path.join(outputPath, flavorName)}.js`;

    // Write the custom element to the output directory
    LOGGER.debug(`Creating ${filePath}`);
    await fs.mkdirp(outputPath);
    await fs.writeFile(
      filePath,
      fileContent,
      {
        encoding: 'utf8',
      }
    );

    // Create a new custom element asset type and add it to the flavor
    flavor.types.set(
      'customElement',
      new Asset(icon.iconPath, {
        name: flavorName,
        path: `./${flavorName}.js`,
      })
    );

    return flavor;
  },
};
