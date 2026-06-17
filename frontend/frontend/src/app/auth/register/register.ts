import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  nom = '';
  email = '';
  password = '';
  password2 = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private eventService: EventService,
    private router: Router,
  ) {}

  async submit() {
    this.error = '';

    if (!this.nom || !this.email || !this.password || !this.password2) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }
    if (!this.email.includes('@') || !this.email.includes('.')) {
      this.error = 'Adresse email invalide (ex : vous@example.com).';
      return;
    }
    if (this.password.length < 4) {
      this.error = 'Mot de passe trop court — minimum 4 caractères.';
      return;
    }
    if (this.password !== this.password2) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.register(this.email, this.password, this.nom);
      await this.eventService.loadEvents();
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error = e.message || 'Erreur lors de la création du compte.';
    } finally {
      this.loading = false;
    }
  }
}
