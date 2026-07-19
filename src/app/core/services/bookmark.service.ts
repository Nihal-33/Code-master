import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Bookmark {
  id?: string;
  user_id: string;
  chapter_id: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  // Fetch bookmarks
  public getBookmarks(): Observable<Bookmark[]> {
    const user = this.authService.currentUserValue;
    if (!user) return of([]);

    if (this.supabaseService.isMockMode) {
      const saved = localStorage.getItem(`codemaster_bookmarks_${user.id}`);
      return of(saved ? JSON.parse(saved) : []);
    }

    return from(
      this.supabaseService.client
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as Bookmark[];
      })
    );
  }

  // Check if bookmarked
  public isBookmarked(chapterId: string): Observable<boolean> {
    return this.getBookmarks().pipe(
      map(bookmarks => bookmarks.some(b => b.chapter_id === chapterId))
    );
  }

  // Toggle bookmark (Add or Remove)
  public toggleBookmark(chapterId: string): Observable<boolean> {
    const user = this.authService.currentUserValue;
    if (!user) throw new Error('User not logged in');

    if (this.supabaseService.isMockMode) {
      const key = `codemaster_bookmarks_${user.id}`;
      const saved = localStorage.getItem(key);
      let list: Bookmark[] = saved ? JSON.parse(saved) : [];

      const idx = list.findIndex(b => b.chapter_id === chapterId);
      let active = false;

      if (idx > -1) {
        list.splice(idx, 1);
      } else {
        list.push({ user_id: user.id, chapter_id: chapterId, created_at: new Date().toISOString() });
        active = true;
      }

      localStorage.setItem(key, JSON.stringify(list));
      return of(active);
    }

    // Live mode
    return this.getBookmarks().pipe(
      map(bookmarks => bookmarks.find(b => b.chapter_id === chapterId)),
      map(exists => {
        if (exists) {
          // Remove
          this.supabaseService.client
            .from('bookmarks')
            .delete()
            .eq('id', exists.id)
            .then();
          return false;
        } else {
          // Add
          this.supabaseService.client
            .from('bookmarks')
            .insert({ user_id: user.id, chapter_id: chapterId })
            .then();
          return true;
        }
      })
    );
  }
}
