import { Timestamp } from '@angular/fire/firestore';
import { PaymentMethod, RequestStatus } from './request.model';

export type DeliveryType = 'DELIVERY' | 'PICKUP';

export interface PaymentSimulation {
    method: PaymentMethod;
    paid: boolean;
    transactionId?: string;
}

export interface Order {
    id: string;
    requestId: string;
    requestTitle: string;
    dishId: string;
    darkitchenId: string;
    darkitchenOwnerId: string;
    userId: string;
    price: number;
    deliveryType: DeliveryType;
    status: RequestStatus;
    createdAt: Timestamp;
    paymentSimulation?: PaymentSimulation;
}
