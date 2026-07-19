import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../../core/services/course.service';
import { QuizService, Quiz, QuizAttempt, LeaderboardEntry } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-arena',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz-arena.component.html',
  styleUrls: ['./quiz-arena.component.css']
})
export class QuizArenaComponent implements OnInit {
  courses: Course[] = [];
  quizzes: Quiz[] = [];
  attempts: QuizAttempt[] = [];
  leaderboard: LeaderboardEntry[] = [];

  // Stats
  totalQuizzesCompleted = 0;
  averageAccuracy = 0;
  totalXPGained = 0;

  constructor(
    private courseService: CourseService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses;
    });

    this.quizService.getQuizzes().subscribe(qs => {
      this.quizzes = qs;
    });

    this.quizService.getAttempts().subscribe(attempts => {
      this.attempts = attempts;
      this.totalQuizzesCompleted = attempts.length;
      if (attempts.length > 0) {
        const sumAcc = attempts.reduce((acc, curr) => acc + Number(curr.accuracy), 0);
        this.averageAccuracy = Math.round(sumAcc / attempts.length);
        this.totalXPGained = attempts.reduce((acc, curr) => acc + curr.xp_gained, 0);
      }
    });

    this.quizService.getLeaderboard().subscribe(lb => {
      this.leaderboard = lb;
    });
  }

  getCourseTitle(courseId: string): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.title : 'General Web';
  }

  getQuizTitle(quizId: string): string {
    const quiz = this.quizzes.find(q => q.id === quizId);
    return quiz ? quiz.title : 'Coding Quiz';
  }
}
