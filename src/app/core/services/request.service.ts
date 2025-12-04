import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  CollectionReference,
  DocumentData,
  arrayUnion
} from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, from, map, switchMap } from 'rxjs';
import { Request, PaymentMethod } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private firestore = inject(Firestore);
  private functions = inject(Functions);
  private requestsCollection: CollectionReference<DocumentData>;

  constructor() {
    this.requestsCollection = collection(this.firestore, 'requests');
  }

  getRequestById(requestId: string): Observable<Request | null> {
    const requestDoc = doc(this.requestsCollection, requestId);
    return from(getDoc(requestDoc)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Request;
        }
        return null;
      })
    );
  }

  createRequest(
    userId: string,
    title: string,
    description: string | undefined,
    keywords: string[],
    address: any,
    paymentMethod: PaymentMethod
  ): Observable<Request> {
    const requestDoc = doc(this.requestsCollection);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 10 * 60 * 1000); // 10 minutos

    const newRequest: Request = {
      id: requestDoc.id,
      userId,
      title,
      description,
      keywords,
      address,
      paymentMethod,
      status: 'OPEN',
      expiresAt,
      createdAt: now
    };

    return from(setDoc(requestDoc, newRequest)).pipe(
      map(() => newRequest)
    );
  }

  getRequest(id: string): Observable<Request | null> {
    const requestDoc = doc(this.firestore, `requests/${id}`);
    return from(getDoc(requestDoc)).pipe(
      map(docSnap => docSnap.exists() ? docSnap.data() as Request : null)
    );
  }

  getOpenRequestsByKeyword(keyword: string): Observable<Request[]> {
    const q = query(
      this.requestsCollection,
      where('status', '==', 'OPEN'),
      where('keywords', 'array-contains', keyword.toLowerCase())
    );
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data() as Request))
    );
  }

  getAllOpenRequests(): Observable<Request[]> {
    const q = query(this.requestsCollection, where('status', '==', 'OPEN'));
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data() as Request))
    );
  }

  getUserRequests(userId: string): Observable<Request[]> {
    const q = query(this.requestsCollection, where('userId', '==', userId));
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as Request))
    );
  }

  async updateExpiredRequests(requests: Request[]): Promise<void> {
    const now = new Date().getTime();
    const updatePromises: Promise<void>[] = [];

    for (const request of requests) {
      if (request.status === 'OPEN' && request.expiresAt) {
        const expiryTime = request.expiresAt.toDate ? request.expiresAt.toDate().getTime() : request.expiresAt.toDate().getTime();

        if (now > expiryTime) {
          const requestDoc = doc(this.firestore, `requests/${request.id}`);
          updatePromises.push(
            updateDoc(requestDoc, {
              status: 'EXPIRED',
              wasAttended: false
            })
          );
        }
      }
    }

    await Promise.all(updatePromises);
  }

  cancelRequest(requestId: string): Observable<void> {
    const requestDoc = doc(this.firestore, `requests/${requestId}`);
    return from(updateDoc(requestDoc, { status: 'CANCELLED' }));
  }

  acceptRequest(requestId: string, darkitchenId: string, dishId: string, price: number): Observable<void> {
    const acceptRequestFn = httpsCallable(this.functions, 'acceptRequest');
    return from(acceptRequestFn({ requestId, darkitchenId, dishId, price })).pipe(
      map(() => undefined)
    );
  }
}
