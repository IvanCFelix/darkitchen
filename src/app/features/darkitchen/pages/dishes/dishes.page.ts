import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { DishService } from '../../../../core/services/dish.service';
import { DarkitchenService } from '../../../../core/services/darkitchen.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Dish, Darkitchen } from '../../../../core/models';

@Component({
    selector: 'app-dishes',
    templateUrl: './dishes.page.html',
    styleUrls: ['./dishes.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, RouterModule]
})
export class DishesPage implements OnInit {
    private dishService = inject(DishService);
    private darkitchenService = inject(DarkitchenService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    dishes: Dish[] = [];
    filteredDishes: Dish[] = [];
    selectedDarkitchen: Darkitchen | null = null;
    isLoading = true;
    selectedFilter = 'all';

    async ngOnInit(): Promise<void> {
        await this.loadDishes();
    }

    async loadDishes(): Promise<void> {
        const userId = this.authService.getCurrentUserId();
        if (!userId) return;

        try {
            this.isLoading = true;
            // Get user's first darkitchen
            const darkitchens = await this.darkitchenService.getDarkitchensByOwner(userId).toPromise() || [];

            if (darkitchens.length > 0) {
                this.selectedDarkitchen = darkitchens[0];
                // Load dishes for this darkitchen
                this.dishes = await this.dishService.getDishesByDarkitchen(this.selectedDarkitchen.id).toPromise() || [];
                this.filteredDishes = this.dishes;
            }
        } catch (error) {
            console.error('Error loading dishes:', error);
            this.toastService.showError('Error al cargar platillos');
        } finally {
            this.isLoading = false;
        }
    }

    filterDishes(category: string): void {
        this.selectedFilter = category;
        if (category === 'all') {
            this.filteredDishes = this.dishes;
        } else {
            this.filteredDishes = this.dishes.filter(dish =>
                dish.tags?.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
            );
        }
    }

    async deleteDish(dishId: string): Promise<void> {
        try {
            await this.dishService.deleteDish(dishId).toPromise();
            this.toastService.showSuccess('Platillo eliminado');
            await this.loadDishes();
        } catch (error) {
            console.error('Error deleting dish:', error);
            this.toastService.showError('Error al eliminar platillo');
        }
    }
}
