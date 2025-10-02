import { Injectable, inject } from '@angular/core';
import {Firestore,  collection, deleteDoc, doc, onSnapshot} from '@angular/fire/firestore';
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
  private getRoomId(user1: string, user2: string): string {
    return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
  }

  // ✅ Send message to a specific user
  async sendMessage(text: string, senderId: string, receiverId: string, displayName?: string) {
    const roomId = this.getRoomId(senderId, receiverId);
    const messagesCollection = collection(this.firestore, `chats/${roomId}/messages`);

    await addDoc(messagesCollection, {
      text,
      uid: senderId,
      receiverId,
      displayName: displayName || null,
      createdAt: serverTimestamp()
    });
  }

  // ✅ Get messages between two users
  getMessages(uid1: string, uid2: string): Observable<Message[]> {
    const roomId = this.getRoomId(uid1, uid2);
    return new Observable<Message[]>((observer) => {
      const ref = collection(this.firestore, `chats/${roomId}/messages`);
      const q = query(ref, orderBy('createdAt', 'asc'));
      return onSnapshot(q, (snap) => {
        observer.next(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[]);
      });
    });}

  // ✅ delete message
  async deleteMessage(roomId: string, id: string) {
    const ref = doc(this.firestore, `chats/${roomId}/messages/${id}`);
    await deleteDoc(ref);
  }

}
