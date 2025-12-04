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
  isOnHomePage = false;

  constructor() {
    // Escuchar cambios de ruta para mostrar navbar solo en rutas específicas
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.url;
        // Verificar si está en home
        this.isOnHomePage = url === '/home';
        // Mostrar navbar solo en home, orders, cart y profile
        this.showNavbar = url === '/home' ||
          url.startsWith('/orders') ||
          url.startsWith('/cart') ||
          url === '/profile';
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Métodos para obtener iconos y rutas del navbar según el modo
  getSecondNavIcon(): string {
    return this.appModeService.isUserMode ? 'cart-outline' : 'restaurant-outline';
  }

  getSecondNavRoute(): string {
    return this.appModeService.isUserMode ? '/cart' : '/darkitchen/dishes';
  }

  getFourthNavIcon(): string {
    return this.appModeService.isUserMode ? 'receipt-outline' : 'receipt-outline';
  }

  getFourthNavRoute(): string {
    return this.appModeService.isUserMode ? '/orders' : '/darkitchen/dashboard';
  }
}
