import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../../core/services/course.service';
import { ProgressService, UserProgress } from '../../../core/services/progress.service';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css']
})
export class CoursesListComponent implements OnInit {
  courses: Course[] = [];
  progressList: UserProgress[] = [];

  constructor(
    private courseService: CourseService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(data => {
      this.courses = data;
    });

    this.progressService.getProgress().subscribe(progress => {
      this.progressList = progress;
    });
  }

  getCourseProgress(courseId: string): number {
    const completedForCourse = this.progressList.filter(p => {
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
