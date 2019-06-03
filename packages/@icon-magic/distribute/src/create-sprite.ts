import {
  Asset
} from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import { DOMImplementation, DOMParser, XMLSerializer } from 'xmldom';

const LOGGER: Logger = logger('icon-magic:distribute/index');
const serializeToString = new XMLSerializer().serializeToString;

/**
 * Creates an SVG Document and sets its attributes
 * @returns object with created SVG Document and its child svg element
 */
export function createSVGDoc(): { DOCUMENT: Document, svgEl: SVGSVGElement } {
  const DOM = new DOMImplementation();
  const doctype = DOM.createDocumentType('svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
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
 * @param the category to look for as an ID attribute
 * @returns found <defs> element or null if there's none
 */
function findDefs(doc: Document, category: string): Element | null {
  const nodes = [].slice.call(doc.getElementsByTagName('defs'));
  for (const elem of nodes) {
    if (!elem) continue;
    const id = elem.getAttributeNode('id');
    if (id && id.value === category) { return elem; }
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
  const xml = doc.parseFromString(contents as string, "image/svg+xml");
  parent.appendChild(xml.documentElement);
}

/**
 * Appends icon to element
 * @param parent element to append to
 * @param asset the asset whose contents need to be added
 */
export async function appendToSvgDoc(asset: Asset, doc: Document, svgEl: SVGSVGElement, category: string): Promise<void> {
  if (category) {
    // TODO: Replace this with getElementById, which right now doesn't find the <defs> with the ID
    let def = findDefs(doc, category);
    LOGGER.debug(`looking FOR, ${def}`);

    if (!def) {
      def = createDefs(doc, category);
      svgEl.appendChild(def);
    }
    return appendIcon(def, asset);
  }
  else {
   return appendIcon(svgEl, asset);
  }
}

export function convertSVGToString(svgEl: SVGSVGElement): string {
  return serializeToString(svgEl);
}