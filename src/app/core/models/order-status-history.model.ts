import { Timestamp } from '@angular/fire/firestore';
import { OrderStatus } from './order.model';

export interface OrderStatusHistory {
    id: string;
    orderId: string;
    status: OrderStatus;
    timestamp: Timestamp;
    actorId: string;
}
