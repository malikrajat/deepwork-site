import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((err) => {
  // Nothing here is allowed to fail silently: a site that comes up blank is
  // worse than one that says why.
  console.error('DeepWork site failed to start', err);
});
