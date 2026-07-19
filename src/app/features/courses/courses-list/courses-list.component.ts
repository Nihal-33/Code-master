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
  chapterToCourseMap: { [chapterId: string]: string } = {};

  constructor(
    private courseService: CourseService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(data => {
      this.courses = data;
      // Fetch chapters for all courses to build dynamic course mapping
      data.forEach(course => {
        this.courseService.getChapters(course.id).subscribe(chapters => {
          chapters.forEach(ch => {
            this.chapterToCourseMap[ch.id] = course.id;
          });
        });
      });
    });

    this.progressService.getProgress().subscribe(progress => {
      this.progressList = progress;
    });
  }

  getCourseProgress(courseId: string): number {
    const completedForCourse = this.progressList.filter(p => {
      return p.completed && this.chapterToCourseMap[p.chapter_id] === courseId;
    }).length;

    const course = this.courses.find(c => c.id === courseId);
    if (!course) return 0;
    return Math.round((completedForCourse / course.chapters_count) * 100);
  }
}
