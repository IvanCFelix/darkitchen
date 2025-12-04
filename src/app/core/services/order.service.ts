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
  orderBy
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Order, RequestStatus, OrderStatusHistory } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private ordersCollection: CollectionReference<DocumentData>;
  private historyCollection: CollectionReference<DocumentData>;

  constructor() {
    this.ordersCollection = collection(this.firestore, 'orders');
    this.historyCollection = collection(this.firestore, 'orderStatusHistory');
  }

  getOrder(id: string): Observable<Order | null> {
    const orderDoc = doc(this.firestore, `orders/${id}`);
    return from(getDoc(orderDoc)).pipe(
      map(docSnap => docSnap.exists() ? docSnap.data() as Order : null)
    );
  }

  getUserOrders(userId: string): Observable<Order[]> {
    const q = query(this.ordersCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data() as Order))
    );
  }

  getDarkitchenOrders(darkitchenId: string): Observable<Order[]> {
    const q = query(this.ordersCollection, where('darkitchenId', '==', darkitchenId), orderBy('createdAt', 'desc'));
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data() as Order))
    );
  }

  getActiveOrdersForDarkitchen(darkitchenId: string): Observable<Order[]> {
    const q = query(
      this.ordersCollection,
      where('darkitchenId', '==', darkitchenId),
    );
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data() as Order))
    );
  }

  getRequestById(requestId: string): Observable<any> {
    const requestDoc = doc(this.firestore, `requests/${requestId}`);
    return from(getDoc(requestDoc)).pipe(
      map(docSnap => docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null)
    );
  }

  updateOrderStatus(orderId: string, status: RequestStatus, actorId: string): Observable<void> {
    const orderDoc = doc(this.firestore, `orders/${orderId}`);
    const historyDoc = doc(this.historyCollection);

    const historyEntry: OrderStatusHistory = {
      id: historyDoc.id,
      orderId,
      status,
      timestamp: Timestamp.now(),
      actorId
    };

    return from(updateDoc(orderDoc, { status })).pipe(
      map(() => from(setDoc(historyDoc, historyEntry))),
      map(() => undefined)
    );
  }

  getOrderHistory(orderId: string): Observable<OrderStatusHistory[]> {
    const q = query(
      this.historyCollection,
      where('orderId', '==', orderId),
      orderBy('timestamp', 'asc')
    );
    return from(getDocs(q)).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data() as OrderStatusHistory))
    );
  }
}
