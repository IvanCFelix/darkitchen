import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    writeBatch
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Card, CardBrand } from '../models';

@Injectable({
    providedIn: 'root'
})
export class CardService {
    private firestore = inject(Firestore);
    private cardsCollection = collection(this.firestore, 'cards');

    /**
     * Crea una nueva tarjeta para un usuario
     */
    createCard(
        userId: string,
        cardholderName: string,
        cardNumber: string,
        expiryMonth: string,
        expiryYear: string,
        cvv: string
    ): Observable<string> {
        // Extraer últimos 4 dígitos
        const lastFourDigits = cardNumber.slice(-4);

        // Detectar marca de la tarjeta
        const brand = this.detectCardBrand(cardNumber);

        const cardData: Omit<Card, 'id'> = {
            userId,
            cardholderName,
            lastFourDigits,
            brand,
            expiryMonth,
            expiryYear,
            isDefault: false,
            createdAt: Timestamp.now()
        };

        return from(addDoc(this.cardsCollection, cardData)).pipe(
            map(docRef => docRef.id)
        );
    }

    /**
     * Obtiene todas las tarjetas de un usuario
     */
    getCardsByUser(userId: string): Observable<Card[]> {
        const q = query(
            this.cardsCollection,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        return from(getDocs(q)).pipe(
            map(snapshot => {
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Card));
            })
        );
    }

    /**
     * Establece una tarjeta como predeterminada
     */
    async setDefaultCard(userId: string, cardId: string): Promise<void> {
        const batch = writeBatch(this.firestore);

        // Primero, obtener todas las tarjetas del usuario
        const q = query(this.cardsCollection, where('userId', '==', userId));
        const snapshot = await getDocs(q);

        // Desmarcar todas como predeterminadas
        snapshot.docs.forEach(docSnapshot => {
            const cardRef = doc(this.firestore, 'cards', docSnapshot.id);
            batch.update(cardRef, { isDefault: docSnapshot.id === cardId });
        });

        await batch.commit();
    }

    /**
     * Elimina una tarjeta
     */
    deleteCard(cardId: string): Observable<void> {
        const cardRef = doc(this.firestore, 'cards', cardId);
        return from(deleteDoc(cardRef));
    }

    /**
     * Obtiene la tarjeta predeterminada del usuario
     */
    getDefaultCard(userId: string): Observable<Card | null> {
        const q = query(
            this.cardsCollection,
            where('userId', '==', userId),
            where('isDefault', '==', true)
        );

        return from(getDocs(q)).pipe(
            map(snapshot => {
                if (snapshot.empty) return null;
                const doc = snapshot.docs[0];
                return {
                    id: doc.id,
                    ...doc.data()
                } as Card;
            })
        );
    }

    /**
     * Detecta la marca de la tarjeta basándose en el número
     */
    private detectCardBrand(cardNumber: string): CardBrand {
        const cleaned = cardNumber.replace(/\s/g, '');

        if (/^4/.test(cleaned)) return 'VISA';
        if (/^5[1-5]/.test(cleaned)) return 'MASTERCARD';
        if (/^3[47]/.test(cleaned)) return 'AMEX';
        if (/^6(?:011|5)/.test(cleaned)) return 'DISCOVER';

        return 'OTHER';
    }

    /**
     * Valida formato básico de número de tarjeta usando algoritmo de Luhn
     */
    validateCardNumber(cardNumber: string): boolean {
        const cleaned = cardNumber.replace(/\s/g, '');

        if (!/^\d+$/.test(cleaned)) return false;
        if (cleaned.length < 13 || cleaned.length > 19) return false;

        // Algoritmo de Luhn
        let sum = 0;
        let isEven = false;

        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            isEven = !isEven;
        }

        return true
    }

    /**
     * Formatea número de tarjeta para mostrar
     */
    formatCardNumber(cardNumber: string): string {
        const cleaned = cardNumber.replace(/\s/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    }

    /**
     * Obtiene el icono de la marca de tarjeta
     */
    getCardBrandIcon(brand: CardBrand): string {
        const icons: Record<CardBrand, string> = {
            VISA: 'card',
            MASTERCARD: 'card',
            AMEX: 'card',
            DISCOVER: 'card',
            OTHER: 'card-outline'
        };
        return icons[brand];
    }

    /**
     * Obtiene el nombre de la marca
     */
    getCardBrandName(brand: CardBrand): string {
        const names: Record<CardBrand, string> = {
            VISA: 'Visa',
            MASTERCARD: 'Mastercard',
            AMEX: 'American Express',
            DISCOVER: 'Discover',
            OTHER: 'Otra'
        };
        return names[brand];
    }
}
