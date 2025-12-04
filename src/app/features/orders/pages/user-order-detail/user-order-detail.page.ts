import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RequestService } from '../../../../core/services/request.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Request } from '../../../../core/models';

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
  private requestService = inject(RequestService);
  private toastService = inject(ToastService);

  request: Request | null = null;
  isLoading = true;

  async ngOnInit(): Promise<void> {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (!requestId) {
      this.toastService.showError('ID de solicitud inválido');
      this.router.navigate(['/home']);
      return;
    }

    try {
      this.requestService.getRequestById(requestId).subscribe({
        next: async (request) => {
          if (request) {
            // Verificar si está expirada
            if (request.status === 'OPEN' && request.expiresAt) {
              const now = new Date().getTime();
              const expiryTime = request.expiresAt.toDate ? request.expiresAt.toDate().getTime() : request.expiresAt.toDate().getTime();

              if (now > expiryTime) {
                // Actualizar a expirada
                await this.requestService.updateExpiredRequests([request]);
                // Recargar la solicitud
                this.requestService.getRequestById(requestId).subscribe({
                  next: (updatedRequest) => {
                    this.request = updatedRequest;
                    this.isLoading = false;
                  }
                });
                return;
              }
            }
          }
          this.request = request;
          this.isLoading = false;
          console.log('Request loaded:', request);
        },
        error: (error) => {
          console.error('Error loading request:', error);
          this.toastService.showError('Error al cargar la solicitud');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error loading request:', error);
      this.toastService.showError('Error al cargar la solicitud');
      this.isLoading = false;
    }
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'OPEN': 'Abierta',
      'ACCEPTED': 'Aceptada',
      'IN_PROGRESS': 'En preparación',
      'READY': 'Lista',
      'COMPLETED': 'Completada',
      'CANCELLED': 'Cancelada',
      'EXPIRED': 'Expirada'
    };
    return statusTexts[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'OPEN': 'primary',
      'ACCEPTED': 'secondary',
      'IN_PROGRESS': 'warning',
      'READY': 'success',
      'COMPLETED': 'medium',
      'CANCELLED': 'danger',
      'EXPIRED': 'dark'
    };
    return colors[status] || 'medium';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'OPEN': 'search',
      'ACCEPTED': 'checkmark-circle',
      'IN_PROGRESS': 'restaurant',
      'READY': 'bag-check',
      'COMPLETED': 'trophy',
      'CANCELLED': 'close-circle',
      'EXPIRED': 'time'
    };
    return icons[status] || 'help';
  }

  isStatusActive(status: string): boolean {
    if (!this.request) return false;

    const statusOrder = ['OPEN', 'ACCEPTED', 'IN_PROGRESS', 'READY', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(this.request.status);
    const checkIndex = statusOrder.indexOf(status);

    return checkIndex <= currentIndex;
  }

  getTimeRemaining(): string {
    if (!this.request?.expiresAt) return '0';

    const now = new Date().getTime();
    const expiry = this.request.expiresAt.toDate ? this.request.expiresAt.toDate().getTime() : this.request.expiresAt.toDate().getTime();
    const diff = expiry - now;

    if (diff <= 0) return '0';

    const minutes = Math.floor(diff / 60000);
    return minutes.toString();
  }

  back(): void {
    history.back();
  }

}
