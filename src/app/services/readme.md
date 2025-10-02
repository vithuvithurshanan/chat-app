import { Injectable, inject } from '@angular/core';
import {Auth, authState, updateProfile} from '@angular/fire/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class AuthService {

private auth = inject(Auth);
user$: Observable<any> = authState(this.auth); // current user Observable

async signup(email: string, password: string, displayName: string) {
const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    // ✅ displayName set pannurathu
    if (cred.user) {
      await updateProfile(cred.user, { displayName });
    }

    return cred;
}

login(email: string, password: string) {
return signInWithEmailAndPassword(this.auth, email, password);
}

logout() {
return signOut(this.auth);
}
}
// chat
import { Injectable, inject } from '@angular/core';
import {Firestore, collectionData, collection, deleteDoc, doc} from '@angular/fire/firestore';
import { addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Observable } from 'rxjs';

export interface Message {
id?: string;
text: string;
uid: string;
displayName?: string;
createdAt?: any;
}
@Injectable({
providedIn: 'root'
})
export class Chat {
form: any;
send() {
throw new Error("Method not implemented.");
}
messages$(messages$: any): import("@angular/core").NgIterable<any> | null | undefined {
throw new Error("Method not implemented.");
}
private firestore = inject(Firestore);
private messagesCollection = collection(this.firestore, 'messages');
private getChatRoomId(uid1: string, uid2: string): string {
return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

// ✅ Send message to a specific user
sendMessage(text: string, senderId: string, receiverId: string, displayName?: string) {
const chatRoomId = this.getChatRoomId(senderId, receiverId);
const messagesCollection = collection(this.firestore, `chats/${chatRoomId}/messages`);

    return addDoc(messagesCollection, {
      text,
      uid: senderId,
      receiverId,
      displayName: displayName || null,
      createdAt: serverTimestamp()
    });
}

// ✅ Get messages between two users
getMessages(uid1: string, uid2: string): Observable<Message[]> {
const chatRoomId = this.getChatRoomId(uid1, uid2);
const messagesCollection = collection(this.firestore, `chats/${chatRoomId}/messages`);
const q = query(messagesCollection, orderBy('createdAt'));
return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
}

// ✅ delete message
async deleteMessage(chatRoomId: string, id: string) {
const ref = doc(this.firestore, `chats/${chatRoomId}/messages/${id}`);
await deleteDoc(ref);
}
}
