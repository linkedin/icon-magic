import {
  Asset
} from '@icon-magic/icon-models';
import { Logger, logger } from '@icon-magic/logger';
import { DOMImplementation, DOMParser, XMLSerializer } from 'xmldom';

const LOGGER: Logger = logger('icon-magic:distribute/index');
const serializeToString = new XMLSerializer().serializeToString;
/**
 * Creates an SVG Document and sets its attributes
 * @retuns object with created SVG Document and its child svg element
 */
export function createSVGDoc(): { DOCUMENT: Document, svgEl: SVGSVGElement } {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const DOCUMENT = new DOMImplementation().createDocument(SVG_NS, 'svg', null);
  const svgEl = DOCUMENT.createElementNS(SVG_NS, 'svg');
  svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  svgEl.setAttribute('version', '1.1');
  DOCUMENT.appendChild(svgEl);
  LOGGER.debug(`creating svg document ${DOCUMENT}`);
  return { DOCUMENT, svgEl };
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
    let def = doc.getElementById(category);
    if (!def) {
      def = createDefs(doc, category);
      svgEl.appendChild(def);
    }
    await appendIcon(def, asset);
  }
  else {
    await appendIcon(svgEl, asset);
  }
}

export function convertSVGToString(svgEl: SVGSVGElement): string {
  return serializeToString(svgEl);
}