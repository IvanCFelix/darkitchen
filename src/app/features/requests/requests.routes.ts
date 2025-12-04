import { Routes } from '@angular/router';

export const REQUESTS_ROUTES: Routes = [
  {
    path: 'create',
    loadComponent: () => import('./pages/create-request/create-request.page').then(m => m.CreateRequestPage)
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search-requests/search-requests.page').then(m => m.SearchRequestsPage)
  }
];
