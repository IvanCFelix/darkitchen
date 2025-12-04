import { Timestamp } from '@angular/fire/firestore';
import { RequestStatus } from './request.model';

export interface OrderStatusHistory {
    id: string;
    orderId: string;
    status: RequestStatus;
    timestamp: Timestamp;
    actorId: string;
}
