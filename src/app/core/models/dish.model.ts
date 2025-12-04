import { Timestamp } from '@angular/fire/firestore';

export interface DishOptions {
    sizes?: string[];
    extras?: string[];
}

export interface Dish {
    id: string;
    darkitchenId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    available: boolean;
    preparationTime: number;
    options?: DishOptions;
    tags?: string[];
    rating: number;
    reviewCount: number;
    restaurantName?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
