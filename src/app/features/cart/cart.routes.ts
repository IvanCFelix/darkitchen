import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/cart.page').then(m => m.CartPage),
        canActivate: [authGuard]
    }
];
