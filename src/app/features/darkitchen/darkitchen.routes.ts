import { Routes } from '@angular/router';

export const DARKITCHEN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
  },
  {
    path: 'dishes',
    loadComponent: () => import('./pages/dishes/dishes.page').then(m => m.DishesPage)
  },
  {
    path: 'dishes/create',
    loadComponent: () => import('./pages/create-dish/create-dish.page').then(m => m.CreateDishPage)
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/create-darkitchen/create-darkitchen.page').then(m => m.CreateDarkitchenPage)
  }
];
