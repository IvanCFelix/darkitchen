import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-orders/user-orders.page').then(m => m.UserOrdersPage)
  },
  {
    path: 'user-detail/:id',
    loadComponent: () => import('./pages/user-order-detail/user-order-detail.page').then(m => m.UserOrderDetailPage)
  },
  {
    path: 'darkitchen/:id',
    loadComponent: () => import('./pages/darkitchen-order-detail/darkitchen-order-detail.page').then(m => m.DarkitchenOrderDetailPage)
  }
];
