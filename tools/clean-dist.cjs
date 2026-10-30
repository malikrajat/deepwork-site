/**
 * Deletes the client-side fallback the Angular builder writes beside the
 * prerendered page.
 *
 * With `outputMode: "static"` the builder emits two HTML files: `index.html`,
 * which now contains the whole prerendered page, and `index.csr.html`, an empty
 * `<app-root>` shell kept for routes that were not prerendered. This site has one
 * route and it *is* prerendered, so the shell has no purpose — and shipping it
 * would publish a second, thin copy of the page at a guessable URL, which is
 * duplicate content a crawler can find even though nothing links to it.
 *
 * Runs as part of `npm run build`, after `ng build`.
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const CSR_FALLBACK = path.join(ROOT, 'dist', 'deepwork-site', 'browser', 'index.csr.html');

if (fs.existsSync(CSR_FALLBACK)) {
  fs.rmSync(CSR_FALLBACK);
}
