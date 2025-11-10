import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import {Presence} from './presence';
import {CanActivateFn, Router} from '@angular/router';
import {map} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  user$: Observable<any> = authState(this.auth);

  async signup(email: string, password: string, displayName: string) {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);

      if (cred.user) {
        // 1. First update profile in Firebase Auth
        await updateProfile(cred.user, { displayName });

        // 2. Then update Firestore (with error handling)
        try {
          const userRef = doc(this.firestore, `users/${cred.user.uid}`);
          await setDoc(userRef, {
            uid: cred.user.uid,
            displayName,
            email,


            createdAt: new Date()
          });
        } catch (firestoreError) {
          console.error('Firestore update failed:', firestoreError);
          // Don't throw error - user is already created in Auth
          // You can retry this later or implement cleanup
        }
      }

      return cred;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    // ✅ User logged in → start presence tracking
    this.presence.start();
    return cred;
  }
  private presence = inject(Presence);
  async logout(): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await this.presence.setOffline(user.uid); // Presence offline update
      }

      await signOut(this.auth);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  // Optional: Update user profile in both Auth and Firestore
  async updateUserProfile(displayName: string, photoURL?: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No user logged in');

    try {
      // Update Auth profile
      await updateProfile(user, { displayName,  });

      // Update Firestore
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await setDoc(userRef, {
        displayName,

        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }
}

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user$.pipe(
    map((user) => {
      if (user) {
        return true; // ✅ logged in
      } else {
        router.navigateByUrl('/home'); // 🚫 not logged in → go login
        return false;
      }
    })
  );
};
