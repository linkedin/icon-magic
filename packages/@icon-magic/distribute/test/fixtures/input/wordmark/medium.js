/**
 * Auto-generated by @icon-magic plugin
 * https://github.com/linkedin/icon-magic
 *
 * Usage:
 *
 * JS
 * import testPrefixWordmarkMedium './test-prefix-wordmark-medium';
 * testPrefixWordmarkMedium();
 *
 * HTML
 * <test-prefix-wordmark-medium></test-prefix-wordmark-medium>
 */
export default function () {
  // Can't register the same tag more than once. Throws DOMException.
  if (window && !window.customElements.get('test-prefix-wordmark-medium')) {
    window.customElements.define(
      'test-prefix-wordmark-medium',
      class extends HTMLElement {
        // when the element is inserted into DOM
        connectedCallback() {
          this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 16" data-supported-dps="160x20"><path d="M30.41 4.84c0-3.45-2.49-4.64-5.77-4.64h-5.26v15.6h2.78V9.68h2.39l3.37 6.12h3l-3.59-6.51a4.29 4.29 0 003.08-4.45zm-6.06 2.67h-2.19v-5h2.19c2.18 0 3.27.59 3.27 2.37s-1.19 2.63-3.27 2.63zM5.26.2H0v15.6h2.78V10h2.48c3.38 0 6-1.58 6-5S8.74.2 5.26.2zm-.19 7.6H2.78V2.37h2.29c2.28 0 3.47.6 3.47 2.57S7.45 7.8 5.07 7.8zM128 .2v15.6h-2.58V8.69c0-1.48.3-3.65.39-5h-.09l-1.3 3.64-2.68 7h-1.29l-2.68-7-1.19-3.64h-.1c.1 1.38.29 3.55.29 5v7.11h-2.48V.2h3l2.78 7.7 1 3h.1l1-3 2.75-7.7zm-26 0h2.69v8.69c0 5.14-2.19 7.11-5.86 7.11s-6-2-6-7.11V.2h2.78v8.89c0 3.36 1.29 4.44 3.18 4.44S102 12.45 102 9.09zM80.7.2h2.78v15.6H80.7zM68.07.2h3.08v15.6h-2.58V8.69c0-1.48.3-3.65.4-5h-.1l-1.29 3.52-2.69 7.11H63.6l-2.68-7.11-1.19-3.55h-.1c.1 1.38.3 3.55.3 5v7.14h-2.49V.2h3l2.79 7.6 1 3.06h.1l1-3.06zM41.94 13.43h6.85v2.37h-9.63V.2h9.33v2.27h-6.55v4h5.56v2.42h-5.56z" style="isolation:isolate" fill="#fff" fill-opacity=".85"/></svg>';
        }
      }
    );
  }
}
