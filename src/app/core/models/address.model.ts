export interface Address {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    additionalInfo?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}
