import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  xp: number;
  level: string;
  current_streak: number;
  max_streak: number;
  last_activity_date?: string | null;
  achievements: string[];
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.initializeSession();
  }

  private initializeSession(): void {
    if (this.supabaseService.isMockMode) {
      const savedUser = localStorage.getItem('codemaster_mock_user');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } else {
        // Automatically create a default guest profile in mock mode
        const defaultProfile: UserProfile = {
          id: 'mock-user-id-12345',
          full_name: 'Guest Scholar',
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CodeMaster',
          xp: 0,
          level: 'Beginner',
          current_streak: 0,
          max_streak: 0,
          achievements: []
        };
        localStorage.setItem('codemaster_mock_user', JSON.stringify(defaultProfile));
        this.currentUserSubject.next(defaultProfile);
      }
    } else {
      // Listen to Supabase Auth Changes
      this.supabaseService.client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await this.fetchSupabaseProfile(session.user.id);
          this.currentUserSubject.next(profile);
        } else {
          this.currentUserSubject.next(null);
        }
      });
    }
  }

  private async fetchSupabaseProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching profile from Supabase:', error);
      // Return a basic profile if record not loaded yet
      return {
        id: userId,
        full_name: 'New Scholar',
        xp: 0,
        level: 'Beginner',
        current_streak: 0,
        max_streak: 0,
        achievements: []
      };
    }
    return data as UserProfile;
  }

  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  // Sign Up
  public signUp(email: string, password: string, fullName: string): Observable<any> {
    if (this.supabaseService.isMockMode) {
      const mockProfile: UserProfile = {
        id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        full_name: fullName,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName}`,
        xp: 0,
        level: 'Beginner',
        current_streak: 1,
        max_streak: 1,
        achievements: []
      };

      // Save credentials in a mock users list to allow logging back in
      const usersListStr = localStorage.getItem('codemaster_registered_mock_users');
      const usersList = usersListStr ? JSON.parse(usersListStr) : [];
      usersList.push({ email: email.toLowerCase(), password, profile: mockProfile });
      localStorage.setItem('codemaster_registered_mock_users', JSON.stringify(usersList));

      localStorage.setItem('codemaster_mock_user', JSON.stringify(mockProfile));
      this.currentUserSubject.next(mockProfile);
      return of({ success: true, user: mockProfile });
    }

    return from(
      this.supabaseService.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${fullName}`
          }
        }
      })
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data;
      })
    );
  }

  // Login
  public login(email: string, password: string): Observable<any> {
    if (this.supabaseService.isMockMode) {
      const usersListStr = localStorage.getItem('codemaster_registered_mock_users');
      const usersList = usersListStr ? JSON.parse(usersListStr) : [];
      const matchedUser = usersList.find((u: any) => u.email === email.toLowerCase() && u.password === password);

      if (matchedUser) {
        localStorage.setItem('codemaster_mock_user', JSON.stringify(matchedUser.profile));
        this.currentUserSubject.next(matchedUser.profile);
        return of({ success: true, user: matchedUser.profile });
      } else {
        // Fallback for default Guest account
        if (email.toLowerCase() === 'guest@codemaster.com' || email.toLowerCase() === 'guest') {
          const defaultProfile: UserProfile = {
            id: 'mock-user-id-12345',
            full_name: 'Guest Scholar',
            avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CodeMaster',
            xp: 50,
            level: 'Explorer',
            current_streak: 3,
            max_streak: 5,
            achievements: ['First Chapter']
          };
          localStorage.setItem('codemaster_mock_user', JSON.stringify(defaultProfile));
          this.currentUserSubject.next(defaultProfile);
          return of({ success: true, user: defaultProfile });
        }
        throw new Error('Invalid email or password. Please sign up first.');
      }
    }

    return from(
      this.supabaseService.client.auth.signInWithPassword({ email, password })
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data;
      })
    );
  }

  // Social Sign In with Google / GitHub
  public signInWithProvider(provider: 'google' | 'github'): Observable<any> {
    // For development convenience, we simulate the OAuth flow.
    // This logs the user in instantly and avoids redirecting to unconfigured Supabase OAuth endpoints
    // which throw a 400 validation error on their server.
    const mockProfile: UserProfile = {
      id: 'mock-oauth-' + provider + '-' + Math.random().toString(36).substr(2, 9),
      full_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Scholar`,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${provider}`,
      xp: 150,
      level: 'Explorer',
      current_streak: 1,
      max_streak: 1,
      achievements: []
    };
    localStorage.setItem('codemaster_mock_user', JSON.stringify(mockProfile));
    this.currentUserSubject.next(mockProfile);
    return of({ success: true, user: mockProfile });
  }

  // Logout
  public logout(): Observable<void> {
    if (this.supabaseService.isMockMode) {
      localStorage.removeItem('codemaster_mock_user');
      this.currentUserSubject.next(null);
      this.router.navigate(['/landing']);
      return of(void 0);
    }

    return from(this.supabaseService.client.auth.signOut()).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/landing']);
      }),
      map(() => void 0)
    );
  }

  // Password Recovery
  public resetPassword(email: string): Observable<any> {
    if (this.supabaseService.isMockMode) {
      return of({ success: true, message: 'Password recovery email sent (mock).' });
    }
    return from(
      this.supabaseService.client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login'
      })
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data;
      })
    );
  }

  // Update Profile Stats (XP, Streaks, Achievements)
  public updateProfile(updatedFields: Partial<UserProfile>): Observable<UserProfile> {
    const current = this.currentUserSubject.value;
    if (!current) return of({} as UserProfile);

    const merged = { ...current, ...updatedFields };

    // Calculate level based on XP thresholds
    if (updatedFields.xp !== undefined) {
      merged.level = this.calculateLevel(merged.xp);
    }

    if (this.supabaseService.isMockMode) {
      localStorage.setItem('codemaster_mock_user', JSON.stringify(merged));
      
      // Update registration DB list so it persists across logouts/logins
      const usersListStr = localStorage.getItem('codemaster_registered_mock_users');
      if (usersListStr) {
        const usersList = JSON.parse(usersListStr);
        const idx = usersList.findIndex((u: any) => u.profile.id === merged.id);
        if (idx > -1) {
          usersList[idx].profile = merged;
          localStorage.setItem('codemaster_registered_mock_users', JSON.stringify(usersList));
        }
      }

      this.currentUserSubject.next(merged);
      return of(merged);
    }

    return from(
      this.supabaseService.client
        .from('users')
        .update({
          full_name: merged.full_name,
          avatar_url: merged.avatar_url,
          xp: merged.xp,
          level: merged.level,
          current_streak: merged.current_streak,
          max_streak: merged.max_streak,
          last_activity_date: merged.last_activity_date,
          achievements: merged.achievements
        })
        .eq('id', current.id)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        const profile = res.data as UserProfile;
        this.currentUserSubject.next(profile);
        return profile;
      })
    );
  }

  private calculateLevel(xp: number): string {
    if (xp >= 1000) return 'Master';
    if (xp >= 600) return 'Expert';
    if (xp >= 300) return 'Developer';
    if (xp >= 150) return 'Builder';
    if (xp >= 50) return 'Explorer';
    return 'Beginner';
  }
}
