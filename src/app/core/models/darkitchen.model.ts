import { Timestamp } from '@angular/fire/firestore';

export interface DarkitchenSettings {
    defaultPreparationTime?: number;
    acceptsPayments?: boolean;
}

export interface Darkitchen {
    id: string;
    ownerId: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    deliveryEnabled: boolean;
    pickupEnabled: boolean;
    rating?: number;
    createdAt: Timestamp;
    settings?: DarkitchenSettings;
}
