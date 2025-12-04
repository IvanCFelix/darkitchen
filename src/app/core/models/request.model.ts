import { Timestamp } from '@angular/fire/firestore';
import { Address } from './address.model';

export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER';
export type RequestStatus = 'OPEN' | 'ACCEPTED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export interface Request {
    id: string;
    userId: string;
    title: string;
    description?: string;
    keywords: string[];
    address: Address;
    paymentMethod: PaymentMethod;
    status: RequestStatus;
    expiresAt: Timestamp;
    createdAt: Timestamp;
    acceptedByDarkitchenId?: string;
    acceptedAt?: Timestamp;
    wasAttended?: boolean;
}
