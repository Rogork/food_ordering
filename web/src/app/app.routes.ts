import { LayoutComponent } from './shared/layout/layout.component';
import { Routes } from '@angular/router';
import { LandingAuth } from './shared/auth/landing-auth/landing-auth';
import { isAuthenticated, isNotAuthenticated } from './shared/auth/auth-guards-and-resolvers';
import { Home } from './home/home';
import { NotFound } from './shared/not-found/not-found';

export const routes: Routes = [
  { path: 'auth', canActivate: [isNotAuthenticated], component: LandingAuth },
  {
    path: '',
    canActivate: [isAuthenticated],
    component: LayoutComponent,
    children: [
      { path: '', component: Home },
      { path: '**', component: NotFound }
    ],
  },
  { path: '**', component: NotFound }
];
