import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';

import { map } from 'rxjs/operators';
import {Presence} from '../../services/presence';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-online-users',
  imports: [CommonModule],
  templateUrl: './online-users.html' ,
     styleUrls: ['./online-users.css'],
})
export class OnlineUsers implements OnInit {
  online$: Observable<any>; // ✅ public

  constructor(private presence: Presence,private router: Router) {
    this.online$ = this.presence.getPresence().pipe(
      map(v => v || {})
    );
  }

  ngOnInit(): void {
    this.online$ = this.presence.getPresence().pipe(
      map(users => users || [])
    );
    }
  openChat(userId: string) {
    // User-க்கு message அனுப்பும் பக்கம் திறக்க
    this.router.navigate(['/chat', userId]);
  }

}
