import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private eventService: EventService,
    private router: Router,
  ) {}

  async submit() {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.login(this.email, this.password);
      await this.eventService.loadEvents();
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error = e.message || 'Erreur de connexion.';
    } finally {
      this.loading = false;
    }
  }
}
