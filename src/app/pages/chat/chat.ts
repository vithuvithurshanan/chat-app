import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Chat, Message } from '../../services/chat';
import { AuthService } from '../../services/auth';
import { Presence } from '../../services/presence';
import { firstValueFrom, Observable } from 'rxjs';
import { Router } from '@angular/router';

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

  users$!: Observable<any[]>;
  showUsers: boolean = false; // ✅ toggle for users list

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

    this.form = this.fb.group({
      text: ['', Validators.required]
    });

    this.auth.user$.subscribe(async user => {
      this.currentUser = user?.uid || null;
      if (this.currentUser) {
        this.users$ = this.presence.getPresence();

        // ✅ wait for users list and auto-select
        const users = await firstValueFrom(this.users$);
        const firstOtherUser = users.find(u => u.uid !== this.currentUser);

        if (firstOtherUser) {
          this.selectUser(firstOtherUser);
        }
      }
    });
  }

  toggleUsers() {
    this.showUsers = !this.showUsers;
  }
  private chatRoomId: string | null = null;
  selectUser(user: any) {
    this.selectedUserId = user.uid;
    this.selectedUserName = user.displayName || user.email;
    this.showUsers = false;

    if (this.currentUser && this.selectedUserId) {
      this.messages$ = this.chat.getMessages(this.currentUser, this.selectedUserId);
    }
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
}
