import { type BootstrapContext, bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { config } from './app/app.config.server';

/**
 * The entry the build runs the page through, once, to write `index.html`.
 *
 * This is build-time only: `outputMode` is `static`, so the server bundle is
 * never written to `dist` and nothing serves it. The only artefact is the
 * prerendered HTML.
 */
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;
