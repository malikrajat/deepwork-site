import { type ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServerRendering } from '@angular/ssr';

import { appConfig } from './app.config';

/**
 * Server configuration, used only by the prerenderer at build time.
 *
 * `provideRouter([])` is here for one reason: the prerenderer boots the app and
 * reads the router to ask which URLs to render, so a router has to exist even
 * though the page has no routes. With an empty configuration the extractor
 * returns the root URL, which is the only page this site has. The router is
 * imported by the server entry alone, so it never reaches the browser bundle.
 */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), provideRouter([])],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
