import {Component, OnInit, signal} from '@angular/core';
import { RouterOutlet} from '@angular/router';
import {Presence} from './services/presence';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet,  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private presence: Presence) {
  }
  ngOnInit(): void {
    this.presence.start();
  }
  protected readonly title = signal('wolf-chat');
}
