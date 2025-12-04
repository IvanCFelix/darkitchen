import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { RequestService } from '../../../../core/services/request.service';
import { CardService } from '../../../../core/services/card.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PaymentMethod, Address, Card } from '../../../../core/models';
import { AddCardModalComponent } from '../../../../shared/components/add-card-modal/add-card-modal.component';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.page.html',
  styleUrls: ['./create-request.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CreateRequestPage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private requestService = inject(RequestService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private modalController = inject(ModalController);
  cardService = inject(CardService);

  requestForm: FormGroup;
  isLoading = false;
  cards: Card[] = [];
  selectedCard: Card | null = null;

  constructor() {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''],
      keywords: ['', [Validators.required]],
      paymentMethod: ['CASH', [Validators.required]],
      cardId: [''], // Tarjeta opcional, solo se requiere si se valida
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['México', [Validators.required]],
      additionalInfo: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadCards();
  }

  async loadCards(): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    console.log('👤 Usuario actual:', userId);

    if (!userId) return;

    try {
      const cards = await this.cardService.getCardsByUser(userId).toPromise();
      console.log('💳 Tarjetas recibidas:', cards);
      this.cards = cards || [];

      // Seleccionar la tarjeta predeterminada si existe
      const defaultCard = this.cards.find(c => c.isDefault);
      if (defaultCard) {
        this.selectedCard = defaultCard;
        this.requestForm.patchValue({ cardId: defaultCard.id });
      } else if (this.cards.length > 0) {
        this.selectedCard = this.cards[0];
        this.requestForm.patchValue({ cardId: this.cards[0].id });
      }

      // Marcar el campo como touched para actualizar la validación
      this.requestForm.get('cardId')?.markAsTouched();
      this.requestForm.get('cardId')?.updateValueAndValidity();
    } catch (error) {
      console.error('❌ Error loading cards:', error);
    }
  }

  async openAddCardModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: AddCardModalComponent
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      await this.loadCards();
    }
  }

  onCardChange(event: any): void {
    const cardId = event.detail.value;
    this.selectedCard = this.cards.find(c => c.id === cardId) || null;
  }

  onPaymentMethodChange(event: any): void {
    const method = event.detail.value;

    // Si selecciona tarjeta pero no tiene tarjetas, obligarlo a registrar una
    if (method === 'CARD' && this.cards.length === 0) {
      this.toastService.showError('Debes registrar una tarjeta primero');
      this.requestForm.patchValue({ paymentMethod: 'CASH' });
      return;
    }

    // Si selecciona tarjeta, asegurar que tenga una seleccionada
    if (method === 'CARD' && this.cards.length > 0 && !this.selectedCard) {
      this.selectedCard = this.cards[0];
      this.requestForm.patchValue({ cardId: this.cards[0].id });
    }
  }

  getCardDisplay(card: Card): string {
    return `${this.cardService.getCardBrandName(card.brand)} •••• ${card.lastFourDigits}`;
  }

  async onSubmit(): Promise<void> {
    if (this.requestForm.invalid) {
      this.toastService.showError('Por favor completa todos los campos obligatorios');
      return;
    }

    const paymentMethod = this.requestForm.get('paymentMethod')?.value;

    // Validar tarjeta si el método de pago es CARD
    if (paymentMethod === 'CARD') {
      if (this.cards.length === 0) {
        this.toastService.showError('Debes registrar al menos una tarjeta');
        return;
      }
      if (!this.selectedCard) {
        this.toastService.showError('Debes seleccionar una tarjeta');
        return;
      }
    }

    // Si paga en efectivo, validar que tenga al menos una tarjeta como garantía
    if (paymentMethod === 'CASH' && this.cards.length === 0) {
      this.toastService.showError('Debes registrar al menos una tarjeta como garantía');
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
