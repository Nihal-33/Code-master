import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Note {
  id?: string;
  user_id: string;
  chapter_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  // Fetch all notes for the user
  public getNotes(): Observable<Note[]> {
    const user = this.authService.currentUserValue;
    if (!user) return of([]);

    if (this.supabaseService.isMockMode) {
      const saved = localStorage.getItem(`codemaster_notes_${user.id}`);
      return of(saved ? JSON.parse(saved) : []);
    }

    return from(
      this.supabaseService.client
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as Note[];
      })
    );
  }

  // Fetch note for a specific chapter
  public getNoteForChapter(chapterId: string): Observable<Note | undefined> {
    return this.getNotes().pipe(
      map(notes => notes.find(n => n.chapter_id === chapterId))
    );
  }

  // Save (insert or update) a note
  public saveNote(chapterId: string, content: string): Observable<Note> {
    const user = this.authService.currentUserValue;
    if (!user) throw new Error('User not logged in');

    const noteRecord: Note = {
      user_id: user.id,
      chapter_id: chapterId,
      content,
      updated_at: new Date().toISOString()
    };

    if (this.supabaseService.isMockMode) {
      const key = `codemaster_notes_${user.id}`;
      const saved = localStorage.getItem(key);
      let list: Note[] = saved ? JSON.parse(saved) : [];

      const idx = list.findIndex(n => n.chapter_id === chapterId);
      if (idx > -1) {
        list[idx] = { ...list[idx], content, updated_at: noteRecord.updated_at };
      } else {
        noteRecord.id = 'note-' + Math.random().toString(36).substr(2, 9);
        noteRecord.created_at = new Date().toISOString();
        list.push(noteRecord);
      }

      localStorage.setItem(key, JSON.stringify(list));
      return of(idx > -1 ? list[idx] : noteRecord);
    }

    // Live mode
    return from(
      this.supabaseService.client
        .from('notes')
        .upsert(noteRecord, { onConflict: 'user_id,chapter_id' })
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as Note;
      })
    );
  }

  // Delete note
  public deleteNote(chapterId: string): Observable<boolean> {
    const user = this.authService.currentUserValue;
    if (!user) return of(false);

    if (this.supabaseService.isMockMode) {
      const key = `codemaster_notes_${user.id}`;
      const saved = localStorage.getItem(key);
      if (!saved) return of(false);

      let list: Note[] = JSON.parse(saved);
      const beforeLength = list.length;
      list = list.filter(n => n.chapter_id !== chapterId);
      localStorage.setItem(key, JSON.stringify(list));
      return of(list.length < beforeLength);
    }

    return from(
      this.supabaseService.client
        .from('notes')
        .delete()
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId)
    ).pipe(
      map(res => {
        if (res.error) return false;
        return true;
      })
    );
  }

  // Export notes as PDF simulation or formatted text
  public exportNotesAsFile(chapterTitle: string, noteContent: string): void {
    // Generate clean text/markdown window for printing, triggering standard browser PDF compiler
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow popups to export notes.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>CodeMaster E-Book Note - ${chapterTitle}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              padding: 40px;
              color: #1e293b;
              line-height: 1.6;
            }
            h1 {
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 10px;
              color: #2563eb;
            }
            .metadata {
              font-size: 0.9em;
              color: #64748b;
              margin-bottom: 30px;
            }
            .content {
              white-space: pre-wrap;
              font-size: 1.1em;
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Study Note: ${chapterTitle}</h1>
          <div class="metadata">
            Generated by <strong>CodeMaster E-Book Arena</strong> on ${new Date().toLocaleDateString()}
          </div>
          <div class="content">${noteContent}</div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
