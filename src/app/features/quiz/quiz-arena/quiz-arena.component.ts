import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course, Chapter } from '../../../core/services/course.service';
import { QuizService, Quiz, QuizAttempt, LeaderboardEntry } from '../../../core/services/quiz.service';
import { ProgressService, UserProgress } from '../../../core/services/progress.service';

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
  allChapters: Chapter[] = [];
  progressList: UserProgress[] = [];

  // Stats
  totalQuizzesCompleted = 0;
  averageAccuracy = 0;
  totalXPGained = 0;

  constructor(
    private courseService: CourseService,
    private quizService: QuizService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses;
      // Load all chapters for all courses to check lock conditions
      courses.forEach(c => {
        this.courseService.getChapters(c.id).subscribe(chapters => {
          // Merge avoiding duplicates
          const otherChapters = this.allChapters.filter(ch => ch.course_id !== c.id);
          this.allChapters = [...otherChapters, ...chapters];
        });
      });
    });

    this.progressService.getProgress().subscribe(progress => {
      this.progressList = progress;
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

  isQuizLocked(quiz: Quiz): boolean {
    const courseChapters = this.allChapters.filter(ch => ch.course_id === quiz.course_id);
    if (courseChapters.length === 0) return true; // Default lock if chapters not loaded yet

    for (const ch of courseChapters) {
      // 1. Reading must be completed
      const isRead = this.progressList.some(p => p.chapter_id === ch.id && p.completed);
      if (!isRead) return true;

      // 2. Practice questions must be attempted/completed
      const totalQs = this.progressService.getChapterPracticeQuestionsCount(ch.id);
      const completedQs = this.progressService.getCompletedPracticeQuestions(ch.id).length;
      if (completedQs < totalQs) return true;
    }

    return false; // Unlocked if all chapters read and practice completed
  }
}
