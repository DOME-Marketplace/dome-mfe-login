import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./features/error/error.component').then(m => m.ErrorComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
