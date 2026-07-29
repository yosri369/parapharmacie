import { bootstrapApplication } from '@angular/platform-browser';

// Polyfill for SockJS/STOMP in Angular 17+ Vite builder
(window as any).global = window;

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
