import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Certificate {
  id?: string;
  user_id: string;
  course_id: string | null; // Null if for "Full Frontend Path"
  course_title?: string;
  certificate_code: string;
  issued_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  // Fetch certificates awarded to current user
  public getCertificates(): Observable<Certificate[]> {
    const user = this.authService.currentUserValue;
    if (!user) return of([]);

    if (this.supabaseService.isMockMode) {
      const saved = localStorage.getItem(`codemaster_certs_${user.id}`);
      const list: Certificate[] = saved ? JSON.parse(saved) : [];
      // Populate course titles for readability in UI
      return of(list.map(c => ({
        ...c,
        course_title: this.getCourseTitleById(c.course_id)
      })));
    }

    return from(
      this.supabaseService.client
        .from('certificates')
        .select('*, courses (title)')
        .eq('user_id', user.id)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          course_id: item.course_id,
          certificate_code: item.certificate_code,
          issued_at: item.issued_at,
          course_title: item.courses ? item.courses.title : 'Full Frontend Path'
        })) as Certificate[];
      })
    );
  }

  // Issue a new certificate
  public issueCertificate(courseId: string | null): Observable<Certificate> {
    const user = this.authService.currentUserValue;
    if (!user) throw new Error('User not logged in');

    const courseSlug = courseId ? this.getCourseSlugById(courseId) : 'frontend';
    const randCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certCode = `CM-${courseSlug.toUpperCase()}-${randCode}`;

    const certRecord: Certificate = {
      user_id: user.id,
      course_id: courseId,
      certificate_code: certCode,
      issued_at: new Date().toISOString()
    };

    if (this.supabaseService.isMockMode) {
      const key = `codemaster_certs_${user.id}`;
      const saved = localStorage.getItem(key);
      const list: Certificate[] = saved ? JSON.parse(saved) : [];

      // Check if already exists
      const exists = list.find(c => c.course_id === courseId);
      if (exists) return of({ ...exists, course_title: this.getCourseTitleById(courseId) });

      list.push(certRecord);
      localStorage.setItem(key, JSON.stringify(list));
      return of({ ...certRecord, course_title: this.getCourseTitleById(courseId) });
    }

    // Live mode
    return from(
      this.supabaseService.client
        .from('certificates')
        .insert(certRecord)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return {
          ...res.data,
          course_title: this.getCourseTitleById(courseId)
        } as Certificate;
      })
    );
  }

  // Verify certificate code
  public verifyCertificate(code: string): Observable<{ valid: boolean; recipientName?: string; courseTitle?: string; date?: string } | null> {
    if (this.supabaseService.isMockMode) {
      // Mock validation search across localstorage
      // Iterate keys looking for certs
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('codemaster_certs_')) {
          const list: Certificate[] = JSON.parse(localStorage.getItem(key) || '[]');
          const match = list.find(c => c.certificate_code === code);
          if (match) {
            const userId = key.replace('codemaster_certs_', '');
            // Attempt to get user name
            let name = 'Code Scholar';
            const userSaved = localStorage.getItem('codemaster_mock_user');
            if (userSaved) {
              const u = JSON.parse(userSaved);
              if (u.id === userId) name = u.full_name;
            }
            return of({
              valid: true,
              recipientName: name,
              courseTitle: this.getCourseTitleById(match.course_id),
              date: new Date(match.issued_at || '').toLocaleDateString()
            });
          }
        }
      }
      return of({ valid: false });
    }

    // Live mode
    return from(
      this.supabaseService.client
        .from('certificates')
        .select('*, users (full_name), courses (title)')
        .eq('certificate_code', code)
        .maybeSingle()
    ).pipe(
      map(res => {
        if (res.error || !res.data) return { valid: false };
        const data = res.data;
        return {
          valid: true,
          recipientName: data.users ? data.users.full_name : 'Code Scholar',
          courseTitle: data.courses ? data.courses.title : 'Full Frontend Path',
          date: new Date(data.issued_at).toLocaleDateString()
        };
      })
    );
  }

  // Helper translations
  private getCourseTitleById(id: string | null): string {
    if (!id) return 'Full Frontend Path';
    switch (id) {
      case 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d': return 'HTML5 Mastery';
      case 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e': return 'CSS3 & Modern Layouts';
      case 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f': return 'JavaScript Deep Dive';
      case 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a': return 'Legacy & Modern AngularJS';
      default: return 'Web Development Course';
    }
  }

  private getCourseSlugById(id: string): string {
    switch (id) {
      case 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d': return 'html5';
      case 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e': return 'css3';
      case 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f': return 'javascript';
      case 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a': return 'angularjs';
      default: return 'course';
    }
  }
}
