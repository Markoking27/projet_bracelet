import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://tmwdkrjynqpjocoscron.supabase.co',
      'sb_publishable_8kwnQprH-lDpq_35sW6Kqg_R9ehtITk' // clé publique
    );
  }

  getClient() {
    return this.supabase;
  }
}