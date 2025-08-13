import { LayoutComponent } from './layout/layout.component';
import { Routes } from '@angular/router';
import { LandingAuth } from './auth/landing-auth/landing-auth';
import { isAuthenticated } from './auth/auth-guard';
import { Home } from './home/home';

export const routes: Routes = [
  { path: 'auth', component: LandingAuth },
  {
    path: '',
    canActivate: [isAuthenticated],
    component: LayoutComponent,
    children: [
      { path: '', component: Home }
    ],
  },
];
