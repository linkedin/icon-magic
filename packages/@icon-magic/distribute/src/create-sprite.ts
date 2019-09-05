import {
  Asset,
  SpriteConfig,
  saveContentToFile
} from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import { DOMImplementation, DOMParser, XMLSerializer } from 'xmldom';

import { removeResolutionFromName } from './utils';

const LOGGER: Logger = logger('icon-magic:distribute:create-sprite');
const serializeToString = new XMLSerializer().serializeToString;

/**
 * Creates a sprite and appends SVG icons
 * @param spriteName name of sprite file
 * @param assets assets to add to svg
 * @param groupByCategory (for sprite creation) whether to group by the category attribute
 * @param category the category of icon
 * @param spriteNames object for mapping sprite name to (and storing) svg document and element
 */
export async function addToSprite(
  spriteName: string,
  assets: Asset[],
  groupByCategory: boolean,
  category: string,
  spriteNames: SpriteConfig
): Promise<void> {
  let DOCUMENT, svgEl;
  LOGGER.debug(`1`);
  const promises: any[] = [];
  // If there's no existing sprite with that name
  if (!spriteNames.hasOwnProperty(spriteName)) {
    // Create a new Document and SVG element for the sprite
    ({ DOCUMENT, svgEl } = createSVGDoc());
    // Store the Document and the SVGEl
    // We need the Document because we we're using methods like
    // `createElement` and `getElementById` that can only be
    // called on the Document
    spriteNames[spriteName] = { DOCUMENT, svgEl };
  } else {
    // If one exists, grab the document and the containing <svg> element
    ({ DOCUMENT, svgEl } = spriteNames[spriteName]);
  }
  // Add the svg assets to the containing <svg> element
  // and ultimately because the containing <svg> el
  // is within the Document, the asset will also be added
  // to the Document
  for (const asset of assets) {
    promises.push(
      await appendToSvgDoc(
        asset,
        DOCUMENT,
        svgEl,
        groupByCategory && category ? category : ''
      )
    );
  }
  LOGGER.debug(`4`);
  await Promise.all(promises);
}

/**
 * Creates an SVG Document and sets its attributes
 * @returns object with created SVG Document and its child svg element
 */
export function createSVGDoc(): { DOCUMENT: Document; svgEl: SVGSVGElement } {
  LOGGER.debug(`in create svg doc`);
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
  LOGGER.debug(`creating svg document ${DOCUMENT}`);
  return { DOCUMENT, svgEl };
}

/**
 * Looks for <defs> elements with an ID in Document
 * @param doc the Document to look in
 * @param category to look for as an ID attribute
 * @returns found <defs> element or null if there's none
 */
function findDefs(doc: Document, category: string): Element | null {
  // Get all child nodes of the document that are <defs>
  const nodes = [].slice.call(doc.getElementsByTagName('defs'));
  // Look for a <defs> element with the ID and return if found
  for (const elem of nodes) {
    if (!elem) continue;
    const id = elem.getAttributeNode('id');
    if (id && id.value === category) {
      return elem;
    }
  }
  return null;
}

/**
 * Creates <defs> element and sets ID attribute
 * @param doc Document element to do the creation
 * @param category ID to set on the <defs>
 * @returns newly created <defs> element
 */
function createDefs(doc: Document, category: string): HTMLElement {
  LOGGER.debug(`entering createDefs with ${category}`);
  // Create a <defs> element
  const defs = doc.createElement('defs');
  // Set it's ID to be the icon's category e.g 'ui'
  defs.setAttribute('id', category);
  return defs;
}

/**
 * Appends icon to element
 * @param parent element to append to
 * @param asset the asset whose contents need to be added
 */
async function appendIcon(parent: Element, asset: Asset): Promise<void> {
  LOGGER.debug(`3`);
  LOGGER.debug(`appending ${asset.name} icon`);
  const doc = new DOMParser();
  // Get contents of the asset, since it's an SVG the content will be in XML format
  // Content Buffer | string
  const contents = await asset.getContents();
  // Parse XML from a string into a DOM Document.
  const xml = doc.parseFromString(contents as string, 'image/svg+xml');
  // Append the root node of the DOM document to the parent element
  await parent.appendChild(xml.documentElement);
}

/**
 * Appends icon to element
 * @param parent element to append to
 * @param asset the asset whose contents need to be added
 */
export async function appendToSvgDoc(
  asset: Asset,
  doc: Document,
  svgEl: SVGSVGElement,
  category: string
): Promise<void> {
  LOGGER.debug(`2`);
  LOGGER.debug(`The category is ${category}`);
  // If there's a category property, we want to append the icon to a <defs> element
  // where the value of its ID is the category
  if (category) {
    // TODO: #28 Replace this with getElementById, which right now doesn't find the <defs> with the ID
    // Check if there is an existing <defs> tag with the ID set to the category
    let def = findDefs(doc, category);
    LOGGER.debug(`The <defs> is ${def}`);
    // If there isn't create one and append the <defs> to the svg element
    if (!def) {
      def = createDefs(doc, category);
      svgEl.appendChild(def);
    }
    // Then append the actual icon (asset) to the <defs>
    return await appendIcon(def, asset);
  } else {
    // If there's no category just append to (anywhere) in the svg element
    return await appendIcon(svgEl, asset);
  }
}

function removeSVGResolution(svgEl: SVGSVGElement): SVGSVGElement {
  const children = svgEl.getElementsByTagName('svg');
  let svgs = [].slice.call(children);
  svgs = svgs.filter((icon: Element) => {
    const id = icon.getAttributeNode('id');
    if (id && id.value) {
      const newId = removeResolutionFromName(id.value);
      icon.setAttribute('id', newId);
    }
  });
  return svgEl;
}
/**
 * Saves svg elements stored in an object as a file
 * @param spriteNames object for mapping sprite name to (and storing) svg document and element
 * @param outputPath path to write to
 */
export async function writeSpriteToFile(
  spriteNames: SpriteConfig,
  outputPath: string
): Promise<void> {
  // Go through all the stored sprites
  for (const spriteName in spriteNames) {
    // Get the svg element
    const svgEl = removeSVGResolution(spriteNames[spriteName].svgEl);
    // Write it to file
    await saveContentToFile(
      outputPath,
      spriteName,
      serializeToString(svgEl),
      'svg'
    );
  }
}

/**
 * Partitions list of assets by whether it should be added to a sprite
 * @param assets list of assets to partition
 * @returns object with assets to be added to sprite and assets not to be
 * added
 */
export function partitionAssetsForSprite(
  assets: Asset[],
  variantsToFilter: string[]
): { assetsToAddToSprite: Asset[]; assetsNoSprite: Asset[] } {
  // Create two arrays: 1 with assets to go in sprite and other with assets
  // that won't be added to the sprite
  const [assetsToAddToSprite, assetsNoSprite] = assets.reduce(
    (result: Asset[][], asset: Asset) => {
      result[variantsToFilter.includes(asset.name) ? 0 : 1].push(asset);
      return result;
    },
    [[], []]
  );
  return {
    assetsToAddToSprite,
    assetsNoSprite
  };
}
