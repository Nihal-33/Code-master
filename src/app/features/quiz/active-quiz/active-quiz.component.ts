import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuizService, Quiz, Question, QuizAttempt } from '../../../core/services/quiz.service';
import { CourseService, Chapter } from '../../../core/services/course.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-active-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './active-quiz.component.html',
  styleUrls: ['./active-quiz.component.css']
})
export class ActiveQuizComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  questions: Question[] = [];
  currentIdx = 0;
  selectedAnswers: { [qId: string]: string } = {};

  // Quiz state
  quizCompleted = false;
  timerInterval: any;
  timeLeft = 0; // seconds
  soundEnabled = true;

  // Attempt statistics
  score = 0;
  accuracy = 0;
  xpGained = 0;

  // Weak topics and course chapters mapping recommendations
  weakChapters: string[] = [];
  recommendedChapters: { id: string; title: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const quizId = params.get('quizId');
      if (quizId) {
        this.loadQuiz(quizId);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadQuiz(quizId: string): void {
    this.quizService.getQuizzes().subscribe(allQuizzes => {
      const match = allQuizzes.find(q => q.id === quizId);
      if (match) {
        this.quiz = match;
        this.timeLeft = match.duration_minutes * 60;
        this.startTimer();

        this.quizService.getQuizQuestions(quizId).subscribe(questions => {
          this.questions = questions;
        });
      }
    });
  }

  startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.submitQuiz();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  get formattedTime(): string {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  selectOption(opt: string): void {
    if (this.quizCompleted) return;
    const currentQ = this.questions[this.currentIdx];
    
    // Prevent changing answer once selected
    if (this.selectedAnswers[currentQ.id]) return;

    this.selectedAnswers[currentQ.id] = opt;
    
    // Instant auditory correctness feedback
    const isCorrect = opt.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();
    if (isCorrect) {
      this.playTone(523.25, 'sine', 0.15); // C5 Chirp
    } else {
      this.playTone(220, 'triangle', 0.2); // A3 Boop
    }
  }

  isOptionSelected(opt: string): boolean {
    const currentQ = this.questions[this.currentIdx];
    return this.selectedAnswers[currentQ.id] === opt;
  }

  hasAnswered(qId: string): boolean {
    return !!this.selectedAnswers[qId];
  }

  get answeredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  goNext(): void {
    if (this.currentIdx < this.questions.length - 1) {
      this.currentIdx++;
    }
  }

  goPrev(): void {
    if (this.currentIdx > 0) {
      this.currentIdx--;
    }
  }

  submitQuiz(): void {
    if (this.quizCompleted || !this.quiz) return;
    this.stopTimer();
    this.quizCompleted = true;

    // Calculate score
    let correct = 0;
    const failedChapterIds = new Set<string>();

    this.questions.forEach(q => {
      const selected = this.selectedAnswers[q.id];
      if (selected && selected.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
        correct++;
      } else {
        if (q.chapter_id) {
          failedChapterIds.add(q.chapter_id);
        }
      }
    });

    this.score = correct;
    this.accuracy = parseFloat(((correct / this.questions.length) * 100).toFixed(2));

    // Submit via service
    this.quizService.submitQuizAttempt(this.quiz.id, correct, this.questions.length).subscribe(attempt => {
      this.xpGained = attempt.xp_gained;
    });

    // Sound and Confetti feedback
    if (this.accuracy >= 70) {
      this.triggerConfetti();
      this.playSuccessMelody();
    } else {
      this.playFailureMelody();
    }

    // Recommendation logic: Find chapter names that were failed
    this.recommendedChapters = [];
    failedChapterIds.forEach(id => {
      this.courseService.getChapterById(id).subscribe(chapter => {
        if (chapter) {
          this.recommendedChapters.push({ id: chapter.id, title: chapter.title });
        }
      });
    });
  }

  // Audio synthesize tones using Web Audio API
  toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
  }

  playTone(freq: number, type: OscillatorType, duration: number): void {
    if (!this.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext restriction in browsers
    }
  }

  playSuccessMelody(): void {
    this.playTone(523.25, 'sine', 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15), 150); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.3), 300); // G5
  }

  playFailureMelody(): void {
    this.playTone(220, 'triangle', 0.2); // A3
    setTimeout(() => this.playTone(165, 'triangle', 0.35), 200); // E3
  }

  triggerConfetti(): void {
    try {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Canvas-confetti animation skipped.', e);
    }
  }
}
