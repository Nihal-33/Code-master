import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { ProgressService } from './progress.service';

export interface Quiz {
  id: string;
  title: string;
  course_id: string;
  duration_minutes: number;
  questions_count?: number;
}

export interface Question {
  id: string;
  chapter_id?: string;
  type: 'MCQ' | 'FILL_IN_BLANKS' | 'TRUE_FALSE' | 'PREDICT_OUTPUT' | 'DEBUG_CODE' | 'INTERVIEW';
  question: string;
  options?: string[]; // Parsed from JSONB
  correct_answer: string;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  marks: number;
  tags: string[];
  time_estimate_seconds: number;
}

export interface QuizAttempt {
  id?: string;
  user_id: string;
  quiz_id: string;
  score: number;
  accuracy: number;
  xp_gained: number;
  completed_at?: string;
}

export interface LeaderboardEntry {
  full_name: string;
  xp: number;
  level: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private mockQuizzes: Quiz[] = [
    {
      id: '11111111-3333-3333-3333-111111111111',
      title: 'HTML Basics Challenge',
      course_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      duration_minutes: 10
    },
    {
      id: '22222222-4444-4444-4444-222222222222',
      title: 'Core CSS Layouts Quiz',
      course_id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
      duration_minutes: 12
    },
    {
      id: 'quiz-js-1',
      title: 'JS Scope & Functions Challenge',
      course_id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
      duration_minutes: 15
    },
    {
      id: 'quiz-angular-1',
      title: 'AngularJS MVC Essentials',
      course_id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
      duration_minutes: 15
    }
  ];

  private mockQuestions: { [quizId: string]: Question[] } = {
    '11111111-3333-3333-3333-111111111111': [
      {
        id: 'q-html-1',
        type: 'MCQ',
        question: 'Which HTML tag is used to create a hyperlink?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correct_answer: '<a>',
        explanation: 'The <a> (anchor) tag is used to define hyperlinks which connect pages. The href attribute specifies the destination URL.',
        difficulty: 'Beginner',
        marks: 10,
        tags: ['html', 'basics', 'tags'],
        time_estimate_seconds: 60
      },
      {
        id: 'q-html-2',
        type: 'MCQ',
        question: 'Which doctype declaration is correct for HTML5?',
        options: ['<!DOCTYPE HTML5>', '<!DOCTYPE html>', '<!doctype html5>', '<!DOCTYPE HTML>'],
        correct_answer: '<!DOCTYPE html>',
        explanation: 'In HTML5, the doctype declaration is case-insensitive and is simply written as <!DOCTYPE html> to enable standard rendering mode.',
        difficulty: 'Beginner',
        marks: 10,
        tags: ['html', 'syntax'],
        time_estimate_seconds: 45
      },
      {
        id: 'q-html-3',
        type: 'FILL_IN_BLANKS',
        question: 'The semantic tag used to define navigation links is ________.',
        options: ['<nav>'],
        correct_answer: '<nav>',
        explanation: 'The <nav> element represents a section of a page whose purpose is to provide navigation links, either within the current document or to other documents.',
        difficulty: 'Beginner',
        marks: 10,
        tags: ['semantics', 'accessibility'],
        time_estimate_seconds: 60
      },
      {
        id: 'q-html-4',
        type: 'TRUE_FALSE',
        question: 'Is HTML5 an official standard maintained by the W3C and WHATWG?',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'Yes, HTML5 was jointly developed and is maintained by W3C and WHATWG to build modern web environments.',
        difficulty: 'Beginner',
        marks: 10,
        tags: ['html', 'standards'],
        time_estimate_seconds: 30
      }
    ],
    '22222222-4444-4444-4444-222222222222': [
      {
        id: 'q-css-1',
        type: 'TRUE_FALSE',
        question: 'Setting box-sizing to border-box means that padding and borders are added to the outer dimensions of the element, making it larger.',
        options: ['True', 'False'],
        correct_answer: 'False',
        explanation: 'Setting box-sizing to border-box incorporates the padding and borders inside the declared width/height, keeping the total rendered box dimensions constant.',
        difficulty: 'Intermediate',
        marks: 10,
        tags: ['css', 'box-model'],
        time_estimate_seconds: 50
      },
      {
        id: 'q-css-2',
        type: 'MCQ',
        question: 'Which flex property is used to align items along the main-axis?',
        options: ['align-items', 'justify-content', 'align-content', 'flex-direction'],
        correct_answer: 'justify-content',
        explanation: 'The justify-content property aligns flexible container items when the items do not use all available space on the main-axis.',
        difficulty: 'Beginner',
        marks: 10,
        tags: ['css', 'flexbox'],
        time_estimate_seconds: 60
      }
    ],
    'quiz-js-1': [
      {
        id: 'q-js-1',
        type: 'PREDICT_OUTPUT',
        question: 'What is the output of the following code?\n```js\nfunction test() {\n  var x = 1;\n  if (true) {\n    var x = 2;\n    console.log(x);\n  }\n  console.log(x);\n}\ntest();\n```',
        options: ['2 then 1', '2 then 2', '1 then 2', 'undefined'],
        correct_answer: '2 then 2',
        explanation: 'Since "var" is function-scoped rather than block-scoped, redeclaring "var x" inside the block overwrites the variable "x" in the same function scope, so both logs print 2.',
        difficulty: 'Intermediate',
        marks: 15,
        tags: ['js', 'scope', 'var'],
        time_estimate_seconds: 90
      },
      {
        id: 'q-js-2',
        type: 'MCQ',
        question: 'What does a closure in JavaScript allow?',
        options: [
          'An inner function to access variables from its outer scope.',
          'An outer function to access variables from its inner scope.',
          'Variables to be declared without keywords.',
          'Running code asynchronously.'
        ],
        correct_answer: 'An inner function to access variables from its outer scope.',
        explanation: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment, allowing the inner function to access variables in the outer function scope.',
        difficulty: 'Intermediate',
        marks: 10,
        tags: ['js', 'closures'],
        time_estimate_seconds: 60
      }
    ],
    'quiz-angular-1': [
      {
        id: 'q-ang-1',
        type: 'MCQ',
        question: 'Which AngularJS directive binds scope data to form control values using two-way binding?',
        options: ['ng-bind', 'ng-model', 'ng-value', 'ng-init'],
        correct_answer: 'ng-model',
        explanation: 'ng-model is the standard AngularJS directive used to bind inputs, selects, or textareas to scope models, enabling automatic two-way synchronization.',
        difficulty: 'Beginner',
        marks: 10,
        tags: ['angularjs', 'directives', 'binding'],
        time_estimate_seconds: 60
      },
      {
        id: 'q-ang-2',
        type: 'MCQ',
        question: 'In AngularJS, what is the role of $scope?',
        options: [
          'It represents the DOM window.',
          'It is a service for making HTTP calls.',
          'It connects controllers with HTML templates.',
          'It compiles directives.'
        ],
        correct_answer: 'It connects controllers with HTML templates.',
        explanation: '$scope is the execution context for models in AngularJS and serves as the glue layer linking controllers (code) to the templates (UI).',
        difficulty: 'Beginner',
        marks: 10,
        tags: ['angularjs', 'architecture'],
        time_estimate_seconds: 45
      }
    ]
  };

  private mockLeaderboard: LeaderboardEntry[] = [
    { full_name: 'Alex Developer', xp: 950, level: 'Expert' },
    { full_name: 'Sarah Builder', xp: 580, level: 'Developer' },
    { full_name: 'Dev Ninja', xp: 450, level: 'Developer' },
    { full_name: 'JS Warrior', xp: 320, level: 'Builder' },
    { full_name: 'HTML King', xp: 140, level: 'Explorer' }
  ];

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService,
    private progressService: ProgressService
  ) {}

  // Fetch quizzes for a course (or all quizzes if courseId is omitted)
  public getQuizzes(courseId?: string): Observable<Quiz[]> {
    if (this.supabaseService.isMockMode) {
      if (!courseId) return of(this.mockQuizzes);
      return of(this.mockQuizzes.filter(q => q.course_id === courseId));
    }

    let query = this.supabaseService.client.from('quizzes').select('*');
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    return from(query).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as Quiz[];
      })
    );
  }

  // Fetch questions for a quiz
  public getQuizQuestions(quizId: string): Observable<Question[]> {
    if (this.supabaseService.isMockMode) {
      return of(this.mockQuestions[quizId] || []);
    }

    return from(
      this.supabaseService.client
        .from('quiz_questions')
        .select('question_id, questions (*)')
        .eq('quiz_id', quizId)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        // Map the Supabase nested response structure
        return res.data.map((item: any) => {
          const q = item.questions;
          return {
            id: q.id,
            chapter_id: q.chapter_id,
            type: q.type,
            question: q.question,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            marks: q.marks,
            tags: typeof q.tags === 'string' ? JSON.parse(q.tags) : q.tags,
            time_estimate_seconds: q.time_estimate_seconds
          } as Question;
        });
      })
    );
  }

  // Submit quiz attempt
  public submitQuizAttempt(quizId: string, score: number, totalQuestions: number): Observable<QuizAttempt> {
    const user = this.authService.currentUserValue;
    if (!user) throw new Error('User not logged in');

    const accuracy = parseFloat(((score / totalQuestions) * 100).toFixed(2));
    // XP math: +50 for passing (>=70% accuracy) + bonus for score
    let xpGained = 10; // Base completion XP
    if (accuracy >= 70) {
      xpGained = 50 + (score * 5);
    }

    const attempt: QuizAttempt = {
      user_id: user.id,
      quiz_id: quizId,
      score,
      accuracy,
      xp_gained: xpGained
    };

    if (this.supabaseService.isMockMode) {
      const key = `codemaster_quiz_attempts_${user.id}`;
      const saved = localStorage.getItem(key);
      const attempts: QuizAttempt[] = saved ? JSON.parse(saved) : [];
      attempts.push(attempt);
      localStorage.setItem(key, JSON.stringify(attempts));

      // Award XP
      this.progressService.awardXP(xpGained, 'Quiz Completed');

      // Check Gamification Milestones
      if (accuracy === 100) {
        this.progressService.unlockAchievement('Quiz Master');
      }
      
      const quiz = this.mockQuizzes.find(q => q.id === quizId);
      if (quiz && quiz.course_id === 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' && accuracy >= 80) {
        this.progressService.unlockAchievement('JavaScript Ninja');
      }

      return of(attempt);
    }

    // Live mode
    return from(
      this.supabaseService.client
        .from('quiz_attempts')
        .insert(attempt)
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as QuizAttempt;
      }),
      tap(() => {
        this.progressService.awardXP(xpGained, 'Quiz Completed');
        if (accuracy === 100) {
          this.progressService.unlockAchievement('Quiz Master');
        }
      })
    );
  }

  // Get attempts for a user
  public getAttempts(): Observable<QuizAttempt[]> {
    const user = this.authService.currentUserValue;
    if (!user) return of([]);

    if (this.supabaseService.isMockMode) {
      const key = `codemaster_quiz_attempts_${user.id}`;
      const saved = localStorage.getItem(key);
      return of(saved ? JSON.parse(saved) : []);
    }

    return from(
      this.supabaseService.client
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as QuizAttempt[];
      })
    );
  }

  // Fetch Leaderboard entries
  public getLeaderboard(): Observable<LeaderboardEntry[]> {
    if (this.supabaseService.isMockMode) {
      // Append current user to mockup entries
      const current = this.authService.currentUserValue;
      const list = [...this.mockLeaderboard];
      if (current) {
        const idx = list.findIndex(e => e.full_name === current.full_name);
        if (idx > -1) {
          list[idx].xp = current.xp;
          list[idx].level = current.level;
        } else {
          list.push({ full_name: current.full_name, xp: current.xp, level: current.level });
        }
      }
      return of(list.sort((a, b) => b.xp - a.xp));
    }

    return from(
      this.supabaseService.client
        .from('users')
        .select('full_name, xp, level')
        .order('xp', { ascending: false })
        .limit(10)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as LeaderboardEntry[];
      })
    );
  }
}
