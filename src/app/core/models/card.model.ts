import { Timestamp } from '@angular/fire/firestore';

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'OTHER';

export interface Card {
    id: string;
    userId: string;
    cardholderName: string;
    lastFourDigits: string;
    brand: CardBrand;
    expiryMonth: string;
    expiryYear: string;
    isDefault: boolean;
    createdAt: Timestamp;
}
