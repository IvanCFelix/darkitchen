import { Injectable, inject } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    Timestamp,
    CollectionReference,
    DocumentData
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Dish } from '../models';

@Injectable({
    providedIn: 'root'
})
export class DishService {
    private firestore = inject(Firestore);
    private dishesCollection: CollectionReference<DocumentData>;

    constructor() {
        this.dishesCollection = collection(this.firestore, 'dishes');
    }

    createDish(dish: Omit<Dish, 'id' | 'createdAt' | 'updatedAt'>): Observable<Dish> {
        const dishDoc = doc(this.dishesCollection);
        const now = Timestamp.now();
        const newDish: Dish = {
            ...dish,
            id: dishDoc.id,
            createdAt: now,
            updatedAt: now
        };
        return from(setDoc(dishDoc, newDish)).pipe(
            map(() => newDish)
        );
    }

    getDish(id: string): Observable<Dish | null> {
        const dishDoc = doc(this.firestore, `dishes/${id}`);
        return from(getDoc(dishDoc)).pipe(
            map(docSnap => {
                if (!docSnap.exists()) return null;
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Dish;
            })
        );
    }

    getDishById(id: string): Observable<Dish | null> {
        return this.getDish(id);
    }

    getAllDishes(): Observable<Dish[]> {
        return from(getDocs(this.dishesCollection)).pipe(
            map(querySnapshot => querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Dish)))
        );
    }

    getDishesByDarkitchen(darkitchenId: string): Observable<Dish[]> {
        const q = query(this.dishesCollection, where('darkitchenId', '==', darkitchenId));
        return from(getDocs(q)).pipe(
            map(querySnapshot => querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Dish)))
        );
    }

    updateDish(id: string, data: Partial<Dish>): Observable<void> {
        const dishDoc = doc(this.firestore, `dishes/${id}`);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now()
        };
        return from(updateDoc(dishDoc, updateData));
    }

    deleteDish(id: string): Observable<void> {
        const dishDoc = doc(this.firestore, `dishes/${id}`);
        return from(deleteDoc(dishDoc));
    }
}
