import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserProfile } from '../../../core/services/auth.service';
import { CourseService, Course } from '../../../core/services/course.service';
import { ProgressService, UserProgress } from '../../../core/services/progress.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  user: UserProfile | null = null;
  courses: Course[] = [];
  progressList: UserProgress[] = [];
  overallProgress = 0;
  totalChaptersCount = 0;
  completedChaptersCount = 0;

  // Static recommendations for quick resuming
  recentChapters = [
    { id: '11111111-1111-1111-1111-111111111111', title: 'Introduction to HTML5', course: 'HTML5 Mastery', type: 'HTML' },
    { id: '33333333-3333-3333-3333-333333333333', title: 'CSS Box Model Explained', course: 'CSS3 & Modern Layouts', type: 'CSS' },
    { id: '44444444-4444-4444-4444-444444444444', title: 'JavaScript Scope & Closure', course: 'JavaScript Deep Dive', type: 'JS' }
  ];

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(profile => {
      this.user = profile;
    });

    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses;
      this.totalChaptersCount = courses.reduce((acc, c) => acc + c.chapters_count, 0);
      this.calculateOverallProgress();
    });

    this.progressService.getProgress().subscribe(progress => {
      this.progressList = progress;
      this.completedChaptersCount = progress.filter(p => p.completed).length;
      this.calculateOverallProgress();
    });
  }

  calculateOverallProgress(): void {
    if (this.totalChaptersCount > 0) {
      this.overallProgress = Math.round((this.completedChaptersCount / this.totalChaptersCount) * 100);
    }
  }

  // Get percentage for a specific course
  getCourseProgress(courseId: string): number {
    // In our seed chapters we have specific ids. Let's count completed chapters for courseId
    // In mock mode we can estimate it based on completed count for simplicity
    const completedForCourse = this.progressList.filter(p => {
      // Find chapter to match course_id
      // Let's fallback: if course is HTML (starts with 'a1b2'), check chapter IDs matching HTML
      if (courseId === 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d') {
        return p.completed && (p.chapter_id.startsWith('1111') || p.chapter_id.startsWith('2222') || p.chapter_id.startsWith('html'));
      }
      if (courseId === 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e') {
        return p.completed && (p.chapter_id.startsWith('3333') || p.chapter_id.startsWith('css'));
      }
      if (courseId === 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f') {
        return p.completed && (p.chapter_id.startsWith('4444') || p.chapter_id.startsWith('js'));
      }
      if (courseId === 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a') {
        return p.completed && p.chapter_id.startsWith('angular');
      }
      return false;
    }).length;

    const course = this.courses.find(c => c.id === courseId);
    if (!course) return 0;
    return Math.round((completedForCourse / course.chapters_count) * 100);
  }
}
