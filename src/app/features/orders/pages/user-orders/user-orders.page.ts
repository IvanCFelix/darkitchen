import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RequestService } from '../../../../core/services/request.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Request } from '../../../../core/models';

@Component({
    selector: 'app-user-orders',
    templateUrl: './user-orders.page.html',
    styleUrls: ['./user-orders.page.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule]
})
export class UserOrdersPage implements OnInit {
    private requestService = inject(RequestService);
    private authService = inject(AuthService);
    private router = inject(Router);

    activeRequest: Request | null = null;
    pastRequests: Request[] = [];
    isLoading = true;

    async ngOnInit(): Promise<void> {
        await this.loadUserRequests();
    }

    async loadUserRequests(): Promise<void> {
        const userId = this.authService.getCurrentUserId();
        if (!userId) {
            this.router.navigate(['/home']);
            return;
        }

        try {
            this.isLoading = true;
            this.requestService.getUserRequests(userId).subscribe(async (requests: Request[]) => {
                // Actualizar solicitudes expiradas
                await this.requestService.updateExpiredRequests(requests);

                // Recargar las solicitudes después de actualizar
                this.requestService.getUserRequests(userId).subscribe((updatedRequests: Request[]) => {
                    // Separar la solicitud activa de las pasadas
                    this.activeRequest = updatedRequests.find(r => r.status === 'OPEN') || null;
                    this.pastRequests = updatedRequests.filter(r => r.status !== 'OPEN');
                    this.isLoading = false;
                });
            });
        } catch (error) {
            console.error('Error loading user requests:', error);
            this.isLoading = false;
        }
    }

    getTimeRemaining(expiresAt: any): string {
        if (!expiresAt) return '0';

        const now = new Date().getTime();
        const expiry = expiresAt.toDate ? expiresAt.toDate().getTime() : new Date(expiresAt).getTime();
        const diff = expiry - now;

        if (diff <= 0) return '0';

        const minutes = Math.floor(diff / 60000);
        return minutes.toString();
    }

    getStatusText(status: string): string {
        const statusMap: { [key: string]: string } = {
            'OPEN': 'Activa',
            'ACCEPTED': 'Aceptada',
            'IN_PROGRESS': 'En preparación',
            'READY': 'Lista',
            'COMPLETED': 'Completada',
            'CANCELLED': 'Cancelada',
            'EXPIRED': 'Expirada'
        };
        return statusMap[status] || status;
    }

    getStatusColor(status: string): string {
        const colorMap: { [key: string]: string } = {
            'OPEN': 'primary',
            'ACCEPTED': 'secondary',
            'IN_PROGRESS': 'warning',
            'READY': 'success',
            'COMPLETED': 'medium',
            'CANCELLED': 'danger',
            'EXPIRED': 'dark'
        };
        return colorMap[status] || 'medium';
    }

    wasAttended(request: Request): boolean {
        return request.status !== 'EXPIRED' && request.status !== 'CANCELLED';
    }

    viewRequestDetail(request: Request): void {
        this.router.navigate(['/orders/user-detail', request.id]);
    }

    goBack(): void {
        this.router.navigate(['/home']);
    }
}
