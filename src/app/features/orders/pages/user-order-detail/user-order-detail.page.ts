import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Order, OrderStatusHistory, OrderStatus } from '../../../../core/models';

@Component({
  selector: 'app-user-order-detail',
  templateUrl: './user-order-detail.page.html',
  styleUrls: ['./user-order-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UserOrderDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  order: Order | null = null;
  orderHistory: OrderStatusHistory[] = [];
  isLoading = true;

  async ngOnInit(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      this.toastService.showError('ID de pedido inválido');
      this.router.navigate(['/home']);
      return;
    }

    try {
      const [order, history] = await Promise.all([
        this.orderService.getOrder(orderId).toPromise(),
        this.orderService.getOrderHistory(orderId).toPromise()
      ]);

      this.order = order || null;
      this.orderHistory = history || [];
    } catch (error) {
      console.error('Error loading order:', error);
      this.toastService.showError('Error al cargar el pedido');
    } finally {
      this.isLoading = false;
    }
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

  getStatusIcon(status: OrderStatus): string {
    const icons: Record<OrderStatus, string> = {
      'PRODUCTION': 'restaurant',
      'SHIPPING': 'bicycle',
      'READY_FOR_PICKUP': 'bag-check',
      'DELIVERED': 'checkmark-circle',
      'FINISHED': 'trophy'
    };
    return icons[status];
  }

  isStatusActive(status: OrderStatus): boolean {
    if (!this.order) return false;
    
    const statusOrder: OrderStatus[] = [
      'PRODUCTION',
      'SHIPPING',
      'READY_FOR_PICKUP',
      'DELIVERED',
      'FINISHED'
    ];

    const currentIndex = statusOrder.indexOf(this.order.status);
    const checkIndex = statusOrder.indexOf(status);
    
    return checkIndex <= currentIndex;
  }
}
