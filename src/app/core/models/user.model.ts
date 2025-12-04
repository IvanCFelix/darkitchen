import { Timestamp } from '@angular/fire/firestore';
import { Address } from './address.model';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    phone?: string;
    address?: Address;
    createdAt: Timestamp;
}
