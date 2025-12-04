import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ToastService } from '../../../core/services/toast.service';
import { Dish } from '../../../core/models';

interface CartItem {
    dish: Dish;
    quantity: number;
}

@Component({
    selector: 'app-cart',
    templateUrl: './cart.page.html',
    styleUrls: ['./cart.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class CartPage implements OnInit {
    private router = inject(Router);
    private toastService = inject(ToastService);

    cartItems: CartItem[] = [];
    isLoading = false;

    ngOnInit(): void {
        this.loadCart();
    }

    loadCart(): void {
        const cart = localStorage.getItem('cart');
        if (cart) {
            this.cartItems = JSON.parse(cart);
        }
    }

    getTotal(): number {
        return this.cartItems.reduce((total, item) => {
            return total + (item.dish.price * item.quantity);
        }, 0);
    }

    getItemsCount(): number {
        return this.cartItems.reduce((count, item) => count + item.quantity, 0);
    }

    increaseQuantity(item: CartItem): void {
        item.quantity++;
        this.saveCart();
    }

    decreaseQuantity(item: CartItem): void {
        if (item.quantity > 1) {
            item.quantity--;
            this.saveCart();
        }
    }

    removeItem(item: CartItem): void {
        const index = this.cartItems.indexOf(item);
        if (index > -1) {
            this.cartItems.splice(index, 1);
            this.saveCart();
            this.toastService.showSuccess('Producto eliminado del carrito');
        }
    }

    saveCart(): void {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }

    clearCart(): void {
        this.cartItems = [];
        localStorage.removeItem('cart');
        this.toastService.showSuccess('Carrito vaciado');
    }

    async confirmOrder(): Promise<void> {
        if (this.cartItems.length === 0) {
            this.toastService.showError('El carrito está vacío');
            return;
        }

        // TODO: Implementar lógica de creación de orden
        this.toastService.showSuccess('Funcionalidad en desarrollo');
        // Por ahora solo navegar a crear solicitud
        // this.router.navigate(['/requests/create']);
    }

    goBack(): void {
        this.router.navigate(['/home']);
    }
}
