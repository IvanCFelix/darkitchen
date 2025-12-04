import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CardService } from '../../../core/services/card.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-add-card-modal',
    templateUrl: './add-card-modal.component.html',
    styleUrls: ['./add-card-modal.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class AddCardModalComponent {
    private fb = inject(FormBuilder);
    private modalController = inject(ModalController);
    private cardService = inject(CardService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);

    cardForm: FormGroup;
    isLoading = false;

    constructor() {
        this.cardForm = this.fb.group({
            cardholderName: ['', [Validators.required, Validators.minLength(3)]],
            cardNumber: ['', [Validators.required, Validators.minLength(13)]],
            expiryMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
            expiryYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
            cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
        });
    }

    formatCardNumber(event: any): void {
        let value = event.target.value.replace(/\s/g, '');
        const formatted = this.cardService.formatCardNumber(value);
        this.cardForm.patchValue({ cardNumber: formatted }, { emitEvent: false });
    }

    onCardNumberInput(): void {
        const cardNumber = this.cardForm.get('cardNumber')?.value.replace(/\s/g, '');
        if (cardNumber && cardNumber.length >= 13) {
            const isValid = this.cardService.validateCardNumber(cardNumber);
            if (!isValid) {
                this.cardForm.get('cardNumber')?.setErrors({ invalidCard: true });
            }
        }
    }

    async onSubmit(): Promise<void> {
        if (this.cardForm.invalid) {
            this.toastService.showError('Por favor completa todos los campos correctamente');
            return;
        }

        const userId = this.authService.getCurrentUserId();
        if (!userId) {
            this.toastService.showError('Usuario no autenticado');
            return;
        }

        this.isLoading = true;

        try {
            const formValue = this.cardForm.value;
            const cardNumber = formValue.cardNumber.replace(/\s/g, '');

            await this.cardService.createCard(
                userId,
                formValue.cardholderName,
                cardNumber,
                formValue.expiryMonth,
                formValue.expiryYear,
                formValue.cvv
            ).toPromise();

            this.toastService.showSuccess('Tarjeta agregada exitosamente');
            this.modalController.dismiss({ success: true });
        } catch (error) {
            console.error('Error adding card:', error);
            this.toastService.showError('Error al agregar la tarjeta');
        } finally {
            this.isLoading = false;
        }
    }

    dismiss(): void {
        this.modalController.dismiss();
    }
}
