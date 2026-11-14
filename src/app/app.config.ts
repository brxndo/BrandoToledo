import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes, withHashLocation(), withComponentInputBinding()), provideHttpClient()],
};
