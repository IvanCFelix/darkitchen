import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { DishService } from '../../../core/services/dish.service';
import { RequestService } from '../../../core/services/request.service';
import { DarkitchenService } from '../../../core/services/darkitchen.service';
import { AppModeService } from '../../../core/services/app-mode.service';
import { User, Dish, Request, Darkitchen } from '../../../core/models';
import { RequestCardComponent } from '../../../shared/components/request-card/request-card.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, FormsModule, RequestCardComponent]
})
export class HomePage implements OnInit {
    private authService = inject(AuthService);
    private dishService = inject(DishService);
    private requestService = inject(RequestService);
    private darkitchenService = inject(DarkitchenService);
    appModeService = inject(AppModeService);
    router = inject(Router);

    user: User | null = null;
    darkitchen: Darkitchen | null = null;
    dishes: Dish[] = [];
    filteredDishes: Dish[] = [];
    requests: Request[] = [];
    filteredRequests: Request[] = [];
    isLoading = true;
    searchTerm = '';
    selectedCategory = 'Todos';

    categories = [
        { name: 'Todos', icon: '🍽️' },
        { name: 'Pizza', icon: '🍕' },
        { name: 'Burger', icon: '🍔' },
        { name: 'Sushi', icon: '🍣' },
        { name: 'Pasta', icon: '🍝' },
        { name: 'Tacos', icon: '🌮' },
        { name: 'Postres', icon: '🍰' },
        { name: 'Bebidas', icon: '🥤' },
        { name: 'Ensaladas', icon: '🥗' }
    ];

    constructor() {
        // Recargar contenido cuando cambie el modo
        effect(() => {
            const mode = this.appModeService.getModeSignal()();
            if (mode === 'user') {
                this.loadDishes();
            } else {
                this.loadDarkitchen();
                this.loadRequests();
            }
        });
    }

    async ngOnInit(): Promise<void> {
        this.authService.getCurrentUser().subscribe(async user => {
            this.user = user;
            if (user) {
                if (this.appModeService.isUserMode) {
                    await this.loadDishes();
                } else {
                    await this.loadDarkitchen();
                    await this.loadRequests();
                }
            }
            this.isLoading = false;
        });
    }

    async loadDishes(): Promise<void> {
        try {
            this.dishService.getAllDishes().subscribe(dishes => {
                this.dishes = dishes || [];
                this.filteredDishes = this.dishes;
            });
        } catch (error) {
            console.error('Error loading dishes:', error);
        }
    }

    async loadDarkitchen(): Promise<void> {
        try {
            const userId = this.authService.getCurrentUserId();
            if (userId) {
                this.darkitchenService.getDarkitchensByOwner(userId).subscribe(darkitchens => {
                    this.darkitchen = darkitchens && darkitchens.length > 0 ? darkitchens[0] : null;
                });
            }
        } catch (error) {
            console.error('Error loading darkitchen:', error);
        }
    }

    async loadRequests(): Promise<void> {
        try {
            this.requestService.getAllOpenRequests().subscribe((requests: any) => {
                this.requests = requests || [];
                this.filteredRequests = this.requests;
            });
        } catch (error) {
            console.error('Error loading requests:', error);
        }
    }

    toggleMode(): void {
        this.appModeService.toggleMode();
        this.searchTerm = '';
        this.selectedCategory = 'Todos';
    }

    selectCategory(category: string): void {
        this.selectedCategory = category;
        this.filterContent();
    }

    filterContent(): void {
        if (this.appModeService.isUserMode) {
            this.filterDishes();
        } else {
            this.filterRequests();
        }
    }

    filterDishes(): void {
        let filtered = this.dishes;

        // Filter by category
        if (this.selectedCategory !== 'Todos') {
            filtered = filtered.filter(dish =>
                dish.category === this.selectedCategory
            );
        }

        // Filter by search term
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(dish =>
                dish.name.toLowerCase().includes(term) ||
                dish.description.toLowerCase().includes(term) ||
                dish.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        this.filteredDishes = filtered;
    }

    filterRequests(): void {
        let filtered = this.requests;

        // Filter by search term
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(request =>
                request.title.toLowerCase().includes(term) ||
                request.description?.toLowerCase().includes(term) ||
                request.keywords.some(keyword => keyword.toLowerCase().includes(term))
            );
        }

        this.filteredRequests = filtered;
    }

    viewDishDetail(dish: Dish): void {
        this.router.navigate(['/dish', dish.id]);
    }

    viewRequestDetail(request: Request): void {
        console.log('View request:', request);
    }

    onAcceptRequest(request: Request): void {
        console.log('Accept request:', request);
        // Aquí se puede navegar a una página de detalles o mostrar un modal
    }

    navigateToProfile(): void {
        this.router.navigate(['/profile']);
    }

    navigateToOrders(): void {
        this.router.navigate(['/orders']);
    }
}
