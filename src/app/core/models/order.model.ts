import { Timestamp } from '@angular/fire/firestore';
import { PaymentMethod } from './request.model';

export type OrderStatus =
    | 'PRODUCTION'
    | 'SHIPPING'
    | 'READY_FOR_PICKUP'
    | 'DELIVERED'
    | 'FINISHED';

export type DeliveryType = 'DELIVERY' | 'PICKUP';

export interface PaymentSimulation {
    method: PaymentMethod;
    paid: boolean;
    transactionId?: string;
}

export interface Order {
    id: string;
    requestId: string;
    dishId: string;
    darkitchenId: string;
    darkitchenOwnerId: string;
    userId: string;
    price: number;
    deliveryType: DeliveryType;
    status: OrderStatus;
    createdAt: Timestamp;
    paymentSimulation?: PaymentSimulation;
}
