import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth.service';
import { EventService } from './event.service';

export interface Malaise {
  id?: number;

  date: string;
  heure: string;

  type: string;
  age: string;
  sexe: string;

  zone: string;
  densite: string;

  event: string;
  evenement: string;

  gravite: string;
  intervention: string;

  temps?: string;
  alcool?: string;
}

@Injectable({ providedIn: 'root' })
export class MalaiseService {
  private _malaises: Malaise[] = [];

  constructor(
    private auth: AuthService,
    private eventService: EventService,
    private supabaseService: SupabaseService   // ✅ AJOUT IMPORTANT
  ) {}

  // =========================
  // GET LOCAL CACHE
  // =========================
  getMalaises(): Malaise[] {
    return this._malaises;
  }

  // =========================
  // LOAD FROM SUPABASE
  // =========================
  async loadMalaisesForEvent(eventId: string | null): Promise<void> {

    const supabase = this.supabaseService.getClient(); // ✅ IMPORTANT

    let query = supabase.from('malaise').select('*');

    if (eventId) {
      const eventName =
        this.eventService.events().find(e => e.id === eventId)?.nom;

      if (eventName) {
        query = query.eq('evenement', eventName);
      }
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Erreur load malaise:', error);
      return;
    }

    this._malaises = data ?? [];
  }

  async loadMalaises(): Promise<void> {
    await this.loadMalaisesForEvent(null);
  }

  // =========================
  // INSERT INTO SUPABASE
  // =========================
  async addMalaise(m: Malaise): Promise<void> {

    const supabase = this.supabaseService.getClient(); // ✅ IMPORTANT

    const { error } = await supabase
      .from('malaise')
      .insert([m]);

    if (error) {
      console.error('Erreur insert malaise:', error);
      throw error;
    }

    this._malaises = [m, ...this._malaises];
  }
}