import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { DarkitchenService } from '../../../../core/services/darkitchen.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-create-darkitchen',
  templateUrl: './create-darkitchen.page.html',
  styleUrls: ['./create-darkitchen.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CreateDarkitchenPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private darkitchenService = inject(DarkitchenService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  darkitchenForm: FormGroup;
  isLoading = false;

  constructor() {
    this.darkitchenForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      deliveryEnabled: [true],
      pickupEnabled: [true]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.darkitchenForm.invalid) {
      this.toastService.showError('Por favor completa todos los campos obligatorios');
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastService.showError('Usuario no autenticado');
      return;
    }

    this.isLoading = true;

    try {
      const formValue = this.darkitchenForm.value;
      
      await this.darkitchenService.createDarkitchen({
        ownerId: userId,
        name: formValue.name,
        description: formValue.description || undefined,
        deliveryEnabled: formValue.deliveryEnabled,
        pickupEnabled: formValue.pickupEnabled,
        rating: 0,
        settings: {
          defaultPreparationTime: 30,
          acceptsPayments: true
        }
      }).toPromise();

      this.toastService.showSuccess('¡Darkitchen creada exitosamente!');
      this.router.navigate(['/darkitchen/dashboard']);
    } catch (error: any) {
      console.error('Error creating darkitchen:', error);
      this.toastService.showError('Error al crear la Darkitchen');
    } finally {
      this.isLoading = false;
    }
  }
}
