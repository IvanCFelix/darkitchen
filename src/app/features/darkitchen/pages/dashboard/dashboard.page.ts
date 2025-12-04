import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { DarkitchenService } from '../../../../core/services/darkitchen.service';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Darkitchen, Order, OrderStatus } from '../../../../core/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DashboardPage implements OnInit {
  private authService = inject(AuthService);
  private darkitchenService = inject(DarkitchenService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  myDarkitchens: Darkitchen[] = [];
  selectedDarkitchen: Darkitchen | null = null;
  activeOrders: Order[] = [];
  isLoading = true;

  // Slider state
  private sliderStates: Map<string, { startX: number; isDragging: boolean }> = new Map();

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
        this.toastService.showInfo('Crea tu primera Darkitchen');
        this.router.navigate(['/darkitchen/create']);
        return;
      }

      this.selectedDarkitchen = this.myDarkitchens[0];
      await this.loadOrders();
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.toastService.showError('Error al cargar el dashboard');
    } finally {
      this.isLoading = false;
    }
  }

  async loadOrders(): Promise<void> {
    if (!this.selectedDarkitchen) return;

    try {
      this.activeOrders = await this.orderService.getActiveOrdersForDarkitchen(this.selectedDarkitchen.id).toPromise() || [];
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    try {
      await this.orderService.updateOrderStatus(orderId, newStatus, userId).toPromise();
      this.toastService.showSuccess(`Estado actualizado a ${this.getStatusText(newStatus)}`);
      await this.loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      this.toastService.showError('Error al actualizar el estado');
    }
  }

  getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      'PRODUCTION': 'SHIPPING',
      'SHIPPING': 'DELIVERED',
      'READY_FOR_PICKUP': 'DELIVERED',
      'DELIVERED': 'FINISHED',
      'FINISHED': null
    };
    return statusFlow[currentStatus];
  }

  getStatusText(status: OrderStatus): string {
    const statusTexts: Record<OrderStatus, string> = {
      'PRODUCTION': 'En producción',
      'SHIPPING': 'En camino',
      'READY_FOR_PICKUP': 'Listo para recoger',
      'DELIVERED': 'Entregado',
      'FINISHED': 'Finalizado'
    };
    return statusTexts[status];
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      'PRODUCTION': 'warning',
      'SHIPPING': 'primary',
      'READY_FOR_PICKUP': 'success',
      'DELIVERED': 'success',
      'FINISHED': 'medium'
    };
    return colors[status];
  }

  navigateToDishes(): void {
    this.router.navigate(['/darkitchen/dishes']);
  }

  navigateToSearchRequests(): void {
    this.router.navigate(['/requests/search']);
  }

  // Slider methods
  onSlideStart(event: any, orderId: string): void {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    this.sliderStates.set(orderId, { startX: clientX, isDragging: true });
  }

  onSlideMove(event: any, orderId: string): void {
    const state = this.sliderStates.get(orderId);
    if (!state || !state.isDragging) return;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const slider = document.getElementById(`slider-${orderId}`);
    const track = document.getElementById(`track-${orderId}`);

    if (!slider || !track) return;

    const trackRect = track.getBoundingClientRect();
    const maxDistance = trackRect.width - 60; // 60px es el ancho del botón
    let distance = clientX - state.startX;

    // Limitar el movimiento
    distance = Math.max(0, Math.min(distance, maxDistance));

    slider.style.transform = `translateX(${distance}px)`;

    // Cambiar opacidad del texto basado en el progreso
    const progress = distance / maxDistance;
    const textElement = track.querySelector('.slide-text') as HTMLElement;
    if (textElement) {
      textElement.style.opacity = (1 - progress * 0.7).toString();
    }
  }

  onSlideEnd(event: any, orderId: string, newStatus: OrderStatus): void {
    const state = this.sliderStates.get(orderId);
    if (!state || !state.isDragging) return;

    const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    const slider = document.getElementById(`slider-${orderId}`);
    const track = document.getElementById(`track-${orderId}`);

    if (!slider || !track) return;

    const trackRect = track.getBoundingClientRect();
    const maxDistance = trackRect.width - 60;
    const distance = clientX - state.startX;
    const progress = distance / maxDistance;

    // Si llegó al menos al 80%, confirmar acción
    if (progress >= 0.8) {
      slider.style.transition = 'transform 0.3s ease';
      slider.style.transform = `translateX(${maxDistance}px)`;

      setTimeout(() => {
        this.updateOrderStatus(orderId, newStatus);
      }, 300);
    } else {
      // Regresar a la posición inicial
      slider.style.transition = 'transform 0.3s ease';
      slider.style.transform = 'translateX(0)';

      const textElement = track.querySelector('.slide-text') as HTMLElement;
      if (textElement) {
        textElement.style.opacity = '1';
      }

      setTimeout(() => {
        slider.style.transition = '';
      }, 300);
    }

    this.sliderStates.set(orderId, { ...state, isDragging: false });
  }
}
