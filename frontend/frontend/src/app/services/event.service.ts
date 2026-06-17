import { Injectable, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';

export interface BraceEvent {
  id: string;
  nom: string;
  lieu: string;
  type: string;
  date: string;
  nbBracelets: number;
  statut: 'planifie' | 'actif' | 'termine';
  totalMalaises: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API = 'http://localhost:3000/api/events';

  private _events = signal<BraceEvent[]>([]);
  private _activeId = signal<string | null>(localStorage.getItem('bfs_activeEvent'));

  readonly events = this._events.asReadonly();
  readonly activeEvent = computed(() => {
    const id = this._activeId();
    return id ? (this._events().find(e => e.id === id) ?? null) : null;
  });

  constructor(private auth: AuthService) {}

  private headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.auth.getToken()}`,
    };
  }

  async loadEvents(): Promise<void> {
    const res = await fetch(this.API, { headers: this.headers() });
    if (!res.ok) return;
    const data: BraceEvent[] = await res.json();
    this._events.set(data);
    const active = data.find(e => e.statut === 'actif');
    if (active) {
      this._activeId.set(active.id);
      localStorage.setItem('bfs_activeEvent', active.id);
    }
  }

  async createEvent(payload: Pick<BraceEvent, 'nom' | 'lieu' | 'type' | 'date' | 'nbBracelets'>): Promise<BraceEvent> {
    const res = await fetch(this.API, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Erreur création événement');
    const event: BraceEvent = await res.json();
    this._events.update(list => [event, ...list]);
    return event;
  }

  async activateEvent(id: string): Promise<void> {
    const res = await fetch(`${this.API}/${id}/activate`, { method: 'PATCH', headers: this.headers() });
    if (!res.ok) throw new Error('Erreur activation');
    this._activeId.set(id);
    localStorage.setItem('bfs_activeEvent', id);
    this._events.update(list =>
      list.map(e => ({
        ...e,
        statut: e.id === id ? 'actif' : (e.statut === 'actif' ? 'planifie' : e.statut),
      } as BraceEvent))
    );
  }

  async closeEvent(id: string): Promise<void> {
    const res = await fetch(`${this.API}/${id}/close`, { method: 'PATCH', headers: this.headers() });
    if (!res.ok) throw new Error('Erreur fermeture');
    if (this._activeId() === id) {
      this._activeId.set(null);
      localStorage.removeItem('bfs_activeEvent');
    }
    this._events.update(list =>
      list.map(e => e.id === id ? { ...e, statut: 'termine' as const } : e)
    );
  }

  clearLocalState(): void {
    this._events.set([]);
    this._activeId.set(null);
    localStorage.removeItem('bfs_activeEvent');
  }
}
