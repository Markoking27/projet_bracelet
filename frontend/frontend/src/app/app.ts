import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { EventService } from './services/event.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  auth = inject(AuthService);
  eventService = inject(EventService);
  private router = inject(Router);

  async ngOnInit() {
    if (this.auth.isAuthenticated()) {
      const valid = await this.auth.validateToken();
      if (!valid) {
        this.auth.clearSession();
        this.eventService.clearLocalState();
        this.router.navigate(['/login']);
        return;
      }
      await this.eventService.loadEvents();
    }
  }

  async logout() {
    await this.auth.logout();
    this.eventService.clearLocalState();
    this.router.navigate(['/login']);
  }
}
