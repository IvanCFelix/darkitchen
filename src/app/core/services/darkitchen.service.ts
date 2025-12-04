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
import { Darkitchen } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DarkitchenService {
  private firestore = inject(Firestore);
  private darkitchensCollection: CollectionReference<DocumentData>;

  constructor() {
    this.darkitchensCollection = collection(this.firestore, 'darkitchens');
  }

  createDarkitchen(darkitchen: Omit<Darkitchen, 'id' | 'createdAt'>): Observable<Darkitchen> {
    const darkitchenDoc = doc(this.darkitchensCollection);
    const newDarkitchen: Darkitchen = {
      ...darkitchen,
      id: darkitchenDoc.id,
      createdAt: Timestamp.now()
    };
    return from(setDoc(darkitchenDoc, newDarkitchen)).pipe(
      map(() => newDarkitchen)
    );
  }

  getDarkitchen(id: string): Observable<Darkitchen | null> {
    const darkitchenDoc = doc(this.firestore, `darkitchens/${id}`);
    return from(getDoc(darkitchenDoc)).pipe(
      map(docSnap => docSnap.exists() ? docSnap.data() as Darkitchen : null)
    );
  }

  getDarkitchensByOwner(ownerId: string): Observable<Darkitchen[]> {
    const q = query(this.darkitchensCollection, where('ownerId', '==', ownerId));
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data() as Darkitchen))
    );
  }

  updateDarkitchen(id: string, data: Partial<Darkitchen>): Observable<void> {
    const darkitchenDoc = doc(this.firestore, `darkitchens/${id}`);
    return from(updateDoc(darkitchenDoc, { ...data }));
  }

  deleteDarkitchen(id: string): Observable<void> {
    const darkitchenDoc = doc(this.firestore, `darkitchens/${id}`);
    return from(deleteDoc(darkitchenDoc));
  }
}
