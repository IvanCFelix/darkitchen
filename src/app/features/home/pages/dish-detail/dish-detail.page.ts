import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DishService } from '../../../../core/services/dish.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Dish } from '../../../../core/models';

interface CartItem {
    dish: Dish;
    quantity: number;
}

@Component({
    selector: 'app-dish-detail',
    templateUrl: './dish-detail.page.html',
    styleUrls: ['./dish-detail.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class DishDetailPage implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private dishService = inject(DishService);
    private toastService = inject(ToastService);

    dish: Dish | null = null;
    isLoading = true;
    isFavorite = false;
    quantity = 1;
    selectedImage = 0;

    async ngOnInit(): Promise<void> {
        const dishId = this.route.snapshot.paramMap.get('id');
        if (!dishId) {
            this.router.navigate(['/home']);
            return;
        }

        await this.loadDish(dishId);
        this.checkIfFavorite();
    }

    async loadDish(dishId: string): Promise<void> {
        try {
            this.isLoading = true;
            const dish = await this.dishService.getDishById(dishId).toPromise();
            this.dish = dish || null;
        } catch (error) {
            console.error('Error loading dish:', error);
            this.toastService.showError('Error al cargar el platillo');
        } finally {
            this.isLoading = false;
        }
    }

    checkIfFavorite(): void {
        if (!this.dish) return;
        const favorites = this.getFavorites();
        this.isFavorite = favorites.some(fav => fav.id === this.dish!.id);
    }

    toggleFavorite(): void {
        if (!this.dish) return;

        const favorites = this.getFavorites();
        const index = favorites.findIndex(fav => fav.id === this.dish!.id);

        if (index > -1) {
            // Remover de favoritos
            favorites.splice(index, 1);
            this.isFavorite = false;
            this.toastService.showSuccess('Eliminado de favoritos');
        } else {
            // Agregar a favoritos
            favorites.push(this.dish);
            this.isFavorite = true;
            this.toastService.showSuccess('Agregado a favoritos');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    getFavorites(): Dish[] {
        const favoritesJson = localStorage.getItem('favorites');
        return favoritesJson ? JSON.parse(favoritesJson) : [];
    }

    addToCart(): void {
        if (!this.dish) return;

        const cart = this.getCart();
        const existingItem = cart.find(item => item.dish.id === this.dish!.id);

        if (existingItem) {
            existingItem.quantity += this.quantity;
        } else {
            cart.push({
                dish: this.dish,
                quantity: this.quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        this.toastService.showSuccess(`${this.quantity} ${this.dish.name} agregado al carrito`);
        this.quantity = 1; // Reset quantity
    }

    getCart(): CartItem[] {
        const cartJson = localStorage.getItem('cart');
        return cartJson ? JSON.parse(cartJson) : [];
    }

    increaseQuantity(): void {
        this.quantity++;
    }

    decreaseQuantity(): void {
        if (this.quantity > 1) {
            this.quantity--;
        }
    }

    selectImage(index: number): void {
        this.selectedImage = index;
    }

    goBack(): void {
        this.router.navigate(['/home']);
    }
}
