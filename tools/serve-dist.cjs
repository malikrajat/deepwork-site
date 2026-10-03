#!/usr/bin/env node
/**
 * Serves the built site for looking at by hand.
 *
 * `npm run serve:dist` after `npm run build`. This is the same server the audit
 * and the llms.txt generator start for themselves; it is exposed on its own
 * because opening the production build in a browser is something you want to do
 * without a test harness attached.
 *
 *   npm run serve:dist            # http://127.0.0.1:5200
 *   PORT=8080 npm run serve:dist
 */

const path = require('node:path');

const { startServer } = require('./static-server.cjs');

const root = path.join(__dirname, '..', 'dist', 'deepwork-site', 'browser');
const port = Number(process.env['PORT'] || 5200);

startServer({ root, port })
  .then(({ url }) => {
    console.log(`serving ${root}\n  ${url}\n\nCtrl+C to stop.`);
  })
  .catch((error) => {
    console.error(String(error.message ?? error));
    process.exit(1);
  });
