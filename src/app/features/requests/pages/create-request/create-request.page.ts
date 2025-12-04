import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { RequestService } from '../../../../core/services/request.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PaymentMethod, Address } from '../../../../core/models';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.page.html',
  styleUrls: ['./create-request.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CreateRequestPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private requestService = inject(RequestService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  requestForm: FormGroup;
  isLoading = false;

  paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'CARD', label: 'Tarjeta' },
    { value: 'CASH', label: 'Efectivo' },
    { value: 'TRANSFER', label: 'Transferencia' }
  ];

  constructor() {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      keywords: ['', [Validators.required]],
      paymentMethod: ['CARD', [Validators.required]],
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['México', [Validators.required]],
      additionalInfo: ['']
    });
  }

  async onSubmit(): Promise<void> {
    if (this.requestForm.invalid) {
      this.toastService.showError('Por favor completa todos los campos obligatorios');
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.toastService.showError('No se pudo obtener el usuario');
      return;
    }

    this.isLoading = true;

    try {
      const formValue = this.requestForm.value;
      
      const address: Address = {
        street: formValue.street,
        number: formValue.number,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zipCode,
        country: formValue.country,
        additionalInfo: formValue.additionalInfo
      };

      const keywords = formValue.keywords
        .split(',')
        .map((k: string) => k.trim().toLowerCase())
        .filter((k: string) => k.length > 0);

      await this.requestService.createRequest(
        userId,
        formValue.title,
        formValue.description || undefined,
        keywords,
        address,
        formValue.paymentMethod
      ).toPromise();

      this.toastService.showSuccess('Solicitud creada exitosamente. Expira en 10 minutos.');
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error creating request:', error);
      this.toastService.showError('Error al crear la solicitud');
    } finally {
      this.isLoading = false;
    }
  }
}
