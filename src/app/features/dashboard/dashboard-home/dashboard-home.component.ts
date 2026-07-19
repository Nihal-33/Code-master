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
  chapterToCourseMap: { [chapterId: string]: string } = {};

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
      
      // Fetch chapters for all courses to build dynamic course mapping
      courses.forEach(course => {
        this.courseService.getChapters(course.id).subscribe(chapters => {
          chapters.forEach(ch => {
            this.chapterToCourseMap[ch.id] = course.id;
          });
          this.calculateOverallProgress();
        });
      });
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
    const completedForCourse = this.progressList.filter(p => {
      return p.completed && this.chapterToCourseMap[p.chapter_id] === courseId;
    }).length;

    const course = this.courses.find(c => c.id === courseId);
    if (!course) return 0;
    return Math.round((completedForCourse / course.chapters_count) * 100);
  }
}
