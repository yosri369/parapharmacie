import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialAuthService, SOCIAL_AUTH_CONFIG } from '@abacritt/angularx-social-login';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideCharts(withDefaultRegisterables()),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              'your_placeholder_google_client_id_here.apps.googleusercontent.com',
              { oneTapEnabled: false }
            )
          }
        ],
        onError: (err) => {
          console.error('Google Auth Error:', err);
        }
      } as SocialAuthServiceConfig,
    },
    SocialAuthService
  ]
};
