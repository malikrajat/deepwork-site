/**
 * A static file server for the built site, in about eighty lines and no
 * dependencies.
 *
 * It exists so that `npm run audit` and `npm run llms` are single commands. Both
 * need the site *served* — the page is client-rendered, so the words only exist
 * once a browser has run the application — and needing a second terminal, or a
 * Python interpreter, to run the checks was a reason not to run the checks.
 *
 * What it does beyond `http.createServer`:
 *
 * - **SPA fallback.** A path that is not a file and has no extension is served
 *   `index.html`, which is what the host does and what makes `/` and any future
 *   route work.
 * - **A real 404.** A missing file *with* an extension gets the shipped
 *   `404.html` and a 404 status, so a broken image link is not answered with a
 *   page of HTML and a 200.
 * - **Path traversal refused.** The resolved path must stay inside the root; a
 *   request for `../../etc/passwd` is a 403, not a read.
 */

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * Serves `root` on `port` and resolves once it is listening.
 *
 * @param {{ root: string, port?: number }} options
 * @returns {Promise<{ url: string, close: () => Promise<void> }>}
 */
function startServer({ root, port = 5200 }) {
  const absoluteRoot = path.resolve(root);

  if (!fs.existsSync(path.join(absoluteRoot, 'index.html'))) {
    return Promise.reject(
      new Error(`no build to serve at ${absoluteRoot} — run \`npm run build\` first`),
    );
  }

  const server = http.createServer((request, response) => {
    const requested = new URL(request.url ?? '/', 'http://localhost').pathname;
    const resolved = path.join(absoluteRoot, decodeURIComponent(requested));

    // Refuse anything that escapes the root before touching the filesystem.
    if (!resolved.startsWith(absoluteRoot)) {
      sendText(response, 403, 'Forbidden');
      return;
    }

    const index = path.join(absoluteRoot, 'index.html');
    let file = resolved;
    let status = 200;

    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      file = path.join(resolved, 'index.html');
    }

    if (!fs.existsSync(file)) {
      // A missing page falls back to the app; a missing *asset* does not,
      // because answering a broken image with HTML and a 200 hides the fault.
      const looksLikeAsset = path.extname(requested) !== '';
      if (looksLikeAsset) {
        const notFound = path.join(absoluteRoot, '404.html');
        file = fs.existsSync(notFound) ? notFound : index;
        status = 404;
      } else {
        file = index;
      }
    }

    if (!fs.existsSync(file)) {
      sendText(response, 404, 'Not found');
      return;
    }

    sendFile(response, file, status);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(() => done())),
      });
    });
  });
}

/**
 * The status and the content type are written once, together, before the body
 * starts. An earlier version called `writeHead` on the stream's `open` event and
 * then set the content type — which throws, because the headers had already gone
 * out, and took the whole generator down with it.
 */
function sendFile(response, file, status) {
  const type = MIME[path.extname(file)] ?? 'application/octet-stream';
  response.writeHead(status, { 'content-type': type });

  const stream = fs.createReadStream(file);
  stream.once('error', () => {
    if (!response.headersSent) sendText(response, 500, 'Read error');
    else response.destroy();
  });
  stream.pipe(response);
}

function sendText(response, status, message) {
  response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
  response.end(message);
}

module.exports = { startServer };
