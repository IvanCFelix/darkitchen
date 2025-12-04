import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { RequestService } from '../../../../core/services/request.service';
import { DarkitchenService } from '../../../../core/services/darkitchen.service';
import { DishService } from '../../../../core/services/dish.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Request, Darkitchen, Dish } from '../../../../core/models';

@Component({
  selector: 'app-search-requests',
  templateUrl: './search-requests.page.html',
  styleUrls: ['./search-requests.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class SearchRequestsPage implements OnInit {
  private requestService = inject(RequestService);
  private darkitchenService = inject(DarkitchenService);
  private dishService = inject(DishService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private modalController = inject(ModalController);
  private router = inject(Router);

  requests: Request[] = [];
  filteredRequests: Request[] = [];
  myDarkitchens: Darkitchen[] = [];
  selectedDarkitchen: Darkitchen | null = null;
  myDishes: Dish[] = [];
  isLoading = true;
  searchTerm = '';

  async ngOnInit(): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastService.showError('Usuario no autenticado');
      this.router.navigate(['/home']);
      return;
    }

    try {
      this.myDarkitchens = await this.darkitchenService.getDarkitchensByOwner(userId).toPromise() || [];
      
      if (this.myDarkitchens.length === 0) {
        this.toastService.showWarning('Primero crea una Darkitchen para responder solicitudes');
        this.router.navigate(['/darkitchen/create']);
        return;
      }

      this.selectedDarkitchen = this.myDarkitchens[0];
      await this.loadDishes();
      await this.loadAllRequests();
    } catch (error) {
      console.error('Error loading data:', error);
      this.toastService.showError('Error al cargar datos');
    } finally {
      this.isLoading = false;
    }
  }

  async loadDishes(): Promise<void> {
    if (!this.selectedDarkitchen) return;
    this.myDishes = await this.dishService.getDishesByDarkitchen(this.selectedDarkitchen.id).toPromise() || [];
  }

  async loadAllRequests(): Promise<void> {
    try {
      this.requests = await this.requestService.getAllOpenRequests().toPromise() || [];
      this.filteredRequests = this.requests;
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }

  onSearchChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRequests = this.requests;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredRequests = this.requests.filter(req =>
      req.title.toLowerCase().includes(term) ||
      req.description?.toLowerCase().includes(term) ||
      req.keywords.some(k => k.includes(term))
    );
  }

  async onAcceptRequest(request: Request): Promise<void> {
    if (!this.selectedDarkitchen) {
      this.toastService.showError('Selecciona una Darkitchen');
      return;
    }

    if (this.myDishes.length === 0) {
      this.toastService.showWarning('Primero crea un platillo para aceptar solicitudes');
      this.router.navigate(['/darkitchen/dishes']);
      return;
    }

    // Seleccionar platillo (aquí simplificado, tomar el primero)
    const dish = this.myDishes[0];

    try {
      await this.requestService.acceptRequest(
        request.id,
        this.selectedDarkitchen.id,
        dish.id,
        dish.price
      ).toPromise();

      this.toastService.showSuccess('¡Solicitud aceptada! Se ha creado el pedido.');
      await this.loadAllRequests();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      this.toastService.showError('Error al aceptar la solicitud');
    }
  }

  getTimeRemaining(request: Request): string {
    const now = new Date().getTime();
    const expires = request.expiresAt.toMillis();
    const remaining = expires - now;

    if (remaining <= 0) return 'Expirada';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
