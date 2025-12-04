import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AppModeService } from './core/services/app-mode.service';

@Component({
  selector: 'app-root',
  imports: [IonRouterOutlet, IonApp, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('darkitchen');
  private router = inject(Router);
  appModeService = inject(AppModeService);
  showNavbar = true;

  constructor() {
    // Escuchar cambios de ruta para mostrar navbar solo en rutas específicas
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url;
        // Mostrar navbar solo en home, orders y profile
        this.showNavbar = url === '/home' ||
          url.startsWith('/orders') ||
          url === '/profile';
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Métodos para obtener iconos y rutas del navbar según el modo
  getSecondNavIcon(): string {
    return this.appModeService.isUserMode ? 'search-outline' : 'restaurant-outline';
  }

  getSecondNavRoute(): string {
    return this.appModeService.isUserMode ? '/requests' : '/darkitchen/orders';
  }

  getFourthNavIcon(): string {
    return this.appModeService.isUserMode ? 'heart-outline' : 'receipt-outline';
  }

  getFourthNavRoute(): string {
    return this.appModeService.isUserMode ? '/orders' : '/darkitchen/dashboard';
  }
}
