import {
  Asset,
  saveContentToFile,
  spriteConfig
} from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import { DOMImplementation, DOMParser, XMLSerializer } from 'xmldom';

const LOGGER: Logger = logger('icon-magic:distribute/index');
const serializeToString = new XMLSerializer().serializeToString;
const DEFAULT_SPRITENAME = 'icons';

/**
 * Creates a sprite and appends SVG icons
 * @param spriteName name of sprite file
 * @param assets assets to add to svg
 * @param outputPath path to write sprite to
 * @param groupByCategory (for sprite creation) whether to group by the category attribute
 * @param category the category of icon
 * @param spriteNames object for mapping sprite name to (and storing) svg document and element
 */
export async function addToSprite(
  spriteName: string,
  assets: Asset[],
  groupByCategory: boolean,
  category: string,
  spriteNames: spriteConfig
): Promise<void> {
  spriteName = spriteName ? spriteName : DEFAULT_SPRITENAME;
  let DOCUMENT, svgEl;
  if (!spriteNames.hasOwnProperty(spriteName)) {
    ({ DOCUMENT, svgEl } = createSVGDoc());
    spriteNames[spriteName] = { DOCUMENT, svgEl };
  } else {
    ({ DOCUMENT, svgEl } = spriteNames[spriteName]);
  }
  for (const asset of assets) {
    await appendToSvgDoc(
      asset,
      DOCUMENT,
      svgEl,
      groupByCategory && category ? category : ''
    );
  }
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
  const DOCUMENT = DOM.createDocument(SVG_NS, 'svg', doctype);
  const svgEl = DOCUMENT.createElementNS(SVG_NS, 'svg');
  svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  svgEl.setAttribute('version', '1.1');
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
  const nodes = [].slice.call(doc.getElementsByTagName('defs'));
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
  const defs = doc.createElement('defs');
  defs.setAttribute('id', category);
  return defs;
}

/**
 * Appends icon to element
 * @param parent element to append to
 * @param asset the asset whose contents need to be added
 */
async function appendIcon(parent: Element, asset: Asset): Promise<void> {
  LOGGER.debug(`appending ${asset.name} icon`);
  const doc = new DOMParser();
  const contents = await asset.getContents();
  const xml = doc.parseFromString(contents as string, 'image/svg+xml');
  parent.appendChild(xml.documentElement);
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
  if (category) {
    // TODO: #28 Replace this with getElementById, which right now doesn't find the <defs> with the ID
    let def = findDefs(doc, category);
    if (!def) {
      def = createDefs(doc, category);
      svgEl.appendChild(def);
    }
    return appendIcon(def, asset);
  } else {
    return appendIcon(svgEl, asset);
  }
}

/**
 * Saves svg elements stored in an object as a file
 * @param spriteNames object for mapping sprite name to (and storing) svg document and element
 * @param outputPath path to write to
 */
export async function writeSpriteToFile(
  spriteNames: spriteConfig,
  outputPath: string
): Promise<void> {
  for (const spriteName in spriteNames) {
    const svgEl = spriteNames[spriteName].svgEl;
    await saveContentToFile(
      outputPath,
      spriteName,
      serializeToString(svgEl),
      'svg'
    );
  }
}
