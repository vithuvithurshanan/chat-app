import { Injectable, inject } from '@angular/core';
import {Firestore, doc, setDoc, serverTimestamp, collection, collectionData} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Presence {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  start() {
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(this.firestore, `users/${user.uid}`);

        // Login ஆகும்போது online = true
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email,
          online: true,
          lastSeen: serverTimestamp()
        }, { merge: true });

        // Browser close / tab close ஆகும்போது offline update
        window.addEventListener('beforeunload', async () => {
          await setDoc(userRef, {
            online: false,
            lastSeen: serverTimestamp()
          }, { merge: true });
        });
      }
    });
  }

  async setOffline(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userRef, {
      online: false,
      lastSeen: serverTimestamp()
    }, { merge: true });
  }
  getPresence(): Observable<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'uid' }) as Observable<any[]>;
  }
}

