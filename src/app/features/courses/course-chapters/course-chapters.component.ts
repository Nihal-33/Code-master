import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course, Chapter } from '../../../core/services/course.service';
import { ProgressService, UserProgress } from '../../../core/services/progress.service';
import { CertificateService } from '../../../core/services/certificate.service';

@Component({
  selector: 'app-course-chapters',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-chapters.component.html',
  styleUrls: ['./course-chapters.component.css']
})
export class CourseChaptersComponent implements OnInit {
  course: Course | null = null;
  chapters: Chapter[] = [];
  progressList: UserProgress[] = [];
  isCourseComplete = false;
  certIssued = false;
  issuedCertCode = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private progressService: ProgressService,
    private certificateService: CertificateService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadCourseData(slug);
      }
    });
  }

  loadCourseData(slug: string): void {
    this.courseService.getCourseBySlug(slug).subscribe(course => {
      if (course) {
        this.course = course;
        
        // Load Chapters
        this.courseService.getChapters(course.id).subscribe(chapters => {
          this.chapters = chapters;
          this.checkCompletion();
        });

        // Load progress
        this.progressService.getProgress().subscribe(progress => {
          this.progressList = progress;
          this.checkCompletion();
        });

        // Check if certificate already exists
        this.certificateService.getCertificates().subscribe(certs => {
          const match = certs.find(c => c.course_id === course.id);
          if (match) {
            this.certIssued = true;
            this.issuedCertCode = match.certificate_code;
          }
        });
      }
    });
  }

  isChapterCompleted(chapterId: string): boolean {
    const record = this.progressList.find(p => p.chapter_id === chapterId);
    return record ? record.completed : false;
  }

  checkCompletion(): void {
    if (this.chapters.length === 0) return;
    
    const completedCount = this.chapters.filter(ch => this.isChapterCompleted(ch.id)).length;
    this.isCourseComplete = completedCount === this.chapters.length;
  }

  claimCertificate(): void {
    if (!this.course || !this.isCourseComplete || this.certIssued) return;

    this.certificateService.issueCertificate(this.course.id).subscribe({
      next: (cert) => {
        this.certIssued = true;
        this.issuedCertCode = cert.certificate_code;
        // Redirect to certificates list to view
        setTimeout(() => {
          this.router.navigate(['/dashboard/certificates']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error issuing certificate:', err);
      }
    });
  }
}
