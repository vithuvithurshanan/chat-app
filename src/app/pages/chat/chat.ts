import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Chat, Message } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { Presence } from '../../services/presence';
import { firstValueFrom, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { onSnapshot, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class ChatComponents implements OnInit {
  messages$!: Observable<Message[]>;
  form!: FormGroup;
  currentUser: string | null = null;
  selectedUserId: string | null = null;
  selectedUserName: string | null = null;  // ✅ To show in header
  selectedUserForDetails: any = null; // ✅ Store full user object for details

  users$!: Observable<any[]>;
  sortedUsers: any[] = []; // ✅ Sorted users list
  recentChats: any[] = []; // ✅ Users with recent messages
  allContacts: any[] = []; // ✅ All other users (contacts)
  showUsers: boolean = false; // ✅ toggle for users list
  showUserDetails: boolean = false; // ✅ toggle for user details panel
  selectedUserDetails: any = null; // ✅ user details to show in sidebar
  chatRooms: Map<string, any> = new Map(); // ✅ Store chat room data
  lastMessageIds: Set<string> = new Set(); // ✅ Track seen messages
  notificationPermission: NotificationPermission = 'default'; // ✅ Notification permission status

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  constructor(
    private chat: Chat,
    private fb: FormBuilder,
    private auth: AuthService,
    private presence: Presence,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.presence.start();
    this.requestNotificationPermission(); // ✅ Request notification permission

    this.form = this.fb.group({
      text: ['', Validators.required]
    });

    this.auth.user$.subscribe(async user => {
      this.currentUser = user?.uid || null;
      if (this.currentUser) {
        this.users$ = this.presence.getPresence();

        // ✅ Subscribe to users and sort them
        this.users$.subscribe(async users => {
          const otherUsers = users.filter(u => u.uid !== this.currentUser);

          // Add sample data for demo
          otherUsers.forEach(u => {
            if (!u.about) u.about = "Hey there! I am using Wolf Chat.";
            if (!u.phone) u.phone = "+1 234 567 8900";
          });

          // Sort users by last message time
          this.sortedUsers = await this.sortUsersByLastMessage(otherUsers);

          // Auto-select first user if none selected
          if (!this.selectedUserId && this.sortedUsers.length > 0) {
            this.selectUser(this.sortedUsers[0]);
          }
        });

        // ✅ Listen to all users' messages for notifications
        this.listenToAllMessages();
      }
    });
  }

  // ✅ Sort users by last message time and separate into recent chats and contacts
  private async sortUsersByLastMessage(users: any[]): Promise<any[]> {
    if (!this.currentUser) return users;

    const usersWithTime = await Promise.all(
      users.map(async (user) => {
        const roomId = this.getRoomId(this.currentUser!, user.uid);
        const lastMessageTime = await this.getLastMessageTime(roomId);
        return { ...user, lastMessageTime };
      })
    );

    // Separate users into recent chats (with messages) and all contacts (without messages)
    this.recentChats = usersWithTime
      .filter(u => u.lastMessageTime > 0)
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    this.allContacts = usersWithTime
      .filter(u => u.lastMessageTime === 0)
      .sort((a, b) => {
        const nameA = (a.displayName || a.email || '').toLowerCase();
        const nameB = (b.displayName || b.email || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });

    // Debug info
    console.log('📊 Users breakdown:');
    console.log('  Total users:', usersWithTime.length);
    console.log('  Recent chats:', this.recentChats.length);
    console.log('  All contacts:', this.allContacts.length);
    console.log('  Recent chats list:', this.recentChats.map(u => u.displayName || u.email));
    console.log('  Contacts list:', this.allContacts.map(u => u.displayName || u.email));

    // Return combined list for backward compatibility
    return [...this.recentChats, ...this.allContacts];
  }

  // ✅ Get last message time for a chat room
  private getLastMessageTime(roomId: string): Promise<number> {
    return new Promise((resolve) => {
      const chatRoomRef = doc(this.chat['firestore'], `chats/${roomId}`);
      const unsubscribe = onSnapshot(chatRoomRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const timestamp = data['lastMessageTime']?.toMillis() || 0;
          resolve(timestamp);
        } else {
          resolve(0);
        }
        unsubscribe();
      });
    });
  }

  // ✅ Get room ID (same logic as in chat service)
  private getRoomId(user1: string, user2: string): string {
    return user1 < user2 ? `${user1}_${user2}` : `${user2}_${user1}`;
  }

  toggleUsers() {
    this.showUsers = !this.showUsers;
  }
  private chatRoomId: string | null = null;
  selectUser(user: any) {
    this.selectedUserId = user.uid;
    this.selectedUserName = user.displayName || user.email;
    this.selectedUserForDetails = user; // ✅ Store full user object
    this.showUsers = false;

    if (this.currentUser && this.selectedUserId) {
      this.messages$ = this.chat.getMessages(this.currentUser, this.selectedUserId);

      // ✅ Re-sort users when a chat is opened (to move it to top after new messages)
      this.users$.subscribe(async users => {
        const otherUsers = users.filter(u => u.uid !== this.currentUser);
        this.sortedUsers = await this.sortUsersByLastMessage(otherUsers);
      });
    }
  }

  // ✅ Show user details panel
  showUserDetailsPanel(user: any) {
    if (user) {
      this.selectedUserDetails = user;
      this.showUserDetails = true;
    }
  }

  // ✅ Close user details panel
  closeUserDetails() {
    this.showUserDetails = false;
    this.selectedUserDetails = null;
  }

  // ✅ Get user initials for avatar
  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }


  async send() {
    if (this.form.invalid || !this.selectedUserId) return;

    const text = this.form.value.text!;
    const user = await firstValueFrom(this.auth.user$);
    if (!user) return;

    await this.chat.sendMessage(
      text,
      user.uid,
      this.selectedUserId,
      user.displayName || user.email || 'Anonymous'
    );

    this.form.reset();
  }

  isMyMessage(m: Message): boolean {
    return m.uid === this.currentUser;
  }

  async delete(m: Message) {
    if (!m.id || !this.currentUser || !this.selectedUserId) return;
    const chatRoomId =
      this.currentUser < this.selectedUserId
        ? `${this.currentUser}_${this.selectedUserId}`
        : `${this.selectedUserId}_${this.currentUser}`;

    if (m.uid === this.currentUser) {
      await this.chat.deleteMessage(chatRoomId, m.id);
    } else {
      alert("You can only delete your own messages!");
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  async logout() {
    try {
      await this.auth.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // ✅ Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', this.notificationPermission);
    }
  }

  // ✅ Show browser notification
  private showNotification(userName: string, message: string) {
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(`New message from ${userName}`, {
        body: message,
        icon: 'https://img.freepik.com/premium-vector/fierce-wolf-w-logo-design-dynamic-bold-branding-emblem_396380-134.jpg?w=740',
        badge: 'https://img.freepik.com/premium-vector/fierce-wolf-w-logo-design-dynamic-bold-branding-emblem_396380-134.jpg?w=740',
        tag: 'wolf-chat-message',
        requireInteraction: false
      });

      // Click notification to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  // ✅ Listen to all messages from all users
  private listenToAllMessages() {
    if (!this.currentUser) return;

    this.users$.subscribe(users => {
      const otherUsers = users.filter(u => u.uid !== this.currentUser);

      otherUsers.forEach(user => {
        const roomId = this.getRoomId(this.currentUser!, user.uid);
        this.chat.getMessages(this.currentUser!, user.uid).subscribe(messages => {
          // Check for new messages
          messages.forEach(msg => {
            // Only notify for messages from others that we haven't seen
            if (msg.uid !== this.currentUser && msg.id && !this.lastMessageIds.has(msg.id)) {
              this.lastMessageIds.add(msg.id);

              // Only show notification if it's a new message (not initial load)
              if (this.lastMessageIds.size > 1) {
                const senderName = msg.displayName || user.displayName || user.email || 'Someone';
                this.showNotification(senderName, msg.text);
                console.log('🔔 New message notification:', senderName, msg.text);
              }
            }
          });
        });
      });
    });
  }
}
