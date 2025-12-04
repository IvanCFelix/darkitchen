import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        canActivate: [noAuthGuard],
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'home',
        canActivate: [authGuard],
        loadComponent: () => import('./features/home/pages/home.page').then(m => m.HomePage)
    },
    {
        path: 'requests',
        canActivate: [authGuard],
        loadChildren: () => import('./features/requests/requests.routes').then(m => m.REQUESTS_ROUTES)
    },
    {
        path: 'orders',
        canActivate: [authGuard],
        loadChildren: () => import('./features/orders/orders.routes').then(m => m.ORDERS_ROUTES)
    },
    {
        path: 'darkitchen',
        canActivate: [authGuard],
        loadChildren: () => import('./features/darkitchen/darkitchen.routes').then(m => m.DARKITCHEN_ROUTES)
    },
    {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/profile/pages/profile.page').then(m => m.ProfilePage)
    }
];
