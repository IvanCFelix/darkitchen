import { Injectable, inject } from '@angular/core';
import {
  Auth,
  User as FirebaseUser,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';
import { Observable, from, switchMap, of } from 'rxjs';
import { Firestore, doc, setDoc, getDoc, Timestamp } from '@angular/fire/firestore';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  readonly user$: Observable<FirebaseUser | null> = authState(this.auth);

  register(email: string, password: string, displayName: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => {
        const firebaseUser = userCredential.user;
        return from(updateProfile(firebaseUser, { displayName })).pipe(
          switchMap(() => {
            const user: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName,
              createdAt: Timestamp.now()
            };
            return from(setDoc(doc(this.firestore, `users/${firebaseUser.uid}`), user)).pipe(
              switchMap(() => of(user))
            );
          })
        );
      })
    );
  }

  login(email: string, password: string): Observable<FirebaseUser> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => of(userCredential.user))
    );
  }

  loginWithGoogle(): Observable<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap(userCredential => {
        const firebaseUser = userCredential.user;
        return from(getDoc(doc(this.firestore, `users/${firebaseUser.uid}`))).pipe(
          switchMap(docSnap => {
            if (!docSnap.exists()) {
              const user: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || 'Usuario',
                createdAt: Timestamp.now()
              };
              return from(setDoc(doc(this.firestore, `users/${firebaseUser.uid}`), user)).pipe(
                switchMap(() => of(firebaseUser))
              );
            }
            return of(firebaseUser);
          })
        );
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$.pipe(
      switchMap(firebaseUser => {
        if (!firebaseUser) {
          return of(null);
        }
        return from(getDoc(doc(this.firestore, `users/${firebaseUser.uid}`))).pipe(
          switchMap(docSnap => {
            if (docSnap.exists()) {
              return of(docSnap.data() as User);
            }
            return of(null);
          })
        );
      })
    );
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }
}
