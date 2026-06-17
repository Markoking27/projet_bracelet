import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { EventService } from './event.service';

export interface Malaise {
  date: string;
  type: string;
  age: string;
  sexe: string;
  zone: string;
  densite: string;
  event: string;
  gravite: string;
  intervention: string;
  temps?: string;
  alcool?: string;
  heure: string;
}

@Injectable({ providedIn: 'root' })
export class MalaiseService {
  private readonly API = 'http://localhost:3000/api/malaises';

  private _malaises: Malaise[] = [];

  constructor(private auth: AuthService, private eventService: EventService) {}

  private authHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.auth.getToken()}`,
    };
  }

  getMalaises(): Malaise[] {
    return this._malaises;
  }

  async loadMalaises(): Promise<void> {
    if (!this.auth.isAuthenticated()) {
      this._malaises = [];
      return;
    }
    const active = this.eventService.activeEvent();
    const url = active ? `${this.API}?eventId=${active.id}` : this.API;
    const res = await fetch(url, { headers: this.authHeaders() });
    if (res.ok) this._malaises = await res.json();
  }

  async addMalaise(m: Malaise): Promise<void> {
    const active = this.eventService.activeEvent();
    if (this.auth.isAuthenticated() && active) {
      await fetch(this.API, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({ eventId: active.id, malaise: m }),
      });
    }
    this._malaises = [m, ...this._malaises];
  }
}
