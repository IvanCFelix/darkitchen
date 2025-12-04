import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: 'user/:id',
    loadComponent: () => import('./pages/user-order-detail/user-order-detail.page').then(m => m.UserOrderDetailPage)
  },
  {
    path: 'darkitchen/:id',
    loadComponent: () => import('./pages/darkitchen-order-detail/darkitchen-order-detail.page').then(m => m.DarkitchenOrderDetailPage)
  }
];
