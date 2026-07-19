import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase!: SupabaseClient;
  private isMock = false;

  constructor() {
    const isDefaultUrl = !environment.supabaseUrl || environment.supabaseUrl.includes('your-supabase-project');
    const isDefaultKey = !environment.supabaseKey || environment.supabaseKey.includes('your-supabase-anon-key');

    if (isDefaultUrl || isDefaultKey) {
      console.warn('Supabase credentials are not configured. Running CodeMaster in Mock mode.');
      this.isMock = true;
    } else {
      try {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
      } catch (err) {
        console.error('Supabase initialization failed. Switching to Mock mode.', err);
        this.isMock = true;
      }
    }
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get isMockMode(): boolean {
    return this.isMock;
  }
}
