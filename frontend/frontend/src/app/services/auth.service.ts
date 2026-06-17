import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  nom: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:3000/api/auth';

  private _token = signal<string | null>(localStorage.getItem('bfs_token'));
  private _user = signal<User | null>((() => {
    try { return JSON.parse(localStorage.getItem('bfs_user') ?? 'null'); }
    catch { return null; }
  })());

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  getToken(): string | null { return this._token(); }

  private setSession(token: string, user: User): void {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem('bfs_token', token);
    localStorage.setItem('bfs_user', JSON.stringify(user));
  }

  async register(email: string, password: string, nom: string): Promise<void> {
    let res: Response;
    try {
      res = await fetch(`${this.API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nom }),
      });
    } catch {
      throw new Error('Impossible de joindre le serveur. Vérifiez que le backend est lancé.');
    }
    if (!res.ok) {
      let msg = 'Erreur lors de l\'inscription';
      try { msg = (await res.json()).error ?? msg; } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    this.setSession(data.token, data.user);
  }

  async login(email: string, password: string): Promise<void> {
    let res: Response;
    try {
      res = await fetch(`${this.API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new Error('Impossible de joindre le serveur. Vérifiez que le backend est lancé.');
    }
    if (!res.ok) {
      let msg = 'Email ou mot de passe incorrect';
      try { msg = (await res.json()).error ?? msg; } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    this.setSession(data.token, data.user);
  }

  async logout(): Promise<void> {
    const token = this._token();
    if (token) {
      await fetch(`${this.API}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('bfs_token');
    localStorage.removeItem('bfs_user');
  }
}
