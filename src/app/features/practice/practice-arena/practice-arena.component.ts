import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course, Chapter } from '../../../core/services/course.service';
import { QuizService, Question } from '../../../core/services/quiz.service';
import { ProgressService } from '../../../core/services/progress.service';

@Component({
  selector: 'app-practice-arena',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './practice-arena.component.html',
  styleUrls: ['./practice-arena.component.css']
})
export class PracticeArenaComponent implements OnInit {
  courses: Course[] = [];
  selectedCourseId = '';
  chapters: Chapter[] = [];
  selectedChapterId = '';
  questions: Question[] = [];

  // Active Practice Question indices
  activeIdx = 0;
  selectedAnswer = '';
  checked = false;
  isCorrect = false;
  xpAwarded = false;

  constructor(
    private courseService: CourseService,
    private quizService: QuizService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses;
      if (courses.length > 0) {
        this.selectedCourseId = courses[0].id;
        this.onCourseChange();
      }
    });
  }

  onCourseChange(): void {
    this.selectedChapterId = '';
    this.questions = [];
    this.courseService.getChapters(this.selectedCourseId).subscribe(chapters => {
      this.chapters = chapters;
      if (chapters.length > 0) {
        this.selectedChapterId = chapters[0].id;
        this.onChapterChange();
      }
    });
  }

  onChapterChange(): void {
    this.questions = [];
    this.activeIdx = 0;
    this.resetQuestionState();

    // In our QuizService seed data, we mapped questions by quizId, but let's query questions for this chapter.
    // For mock mode let's map matching chapterIds to mock questions
    const chId = this.selectedChapterId;
    
    // We can pull questions from QuizService mock questions list
    let list: Question[] = [];
    // HTML Intro
    if (chId === '11111111-1111-1111-1111-111111111111') {
      list = [
        {
          id: 'p1',
          type: 'MCQ',
          question: 'Which HTML tag is used to create a hyperlink?',
          options: ['<link>', '<a>', '<href>', '<url>'],
          correct_answer: '<a>',
          explanation: 'The <a> (anchor) tag is used to define hyperlinks which connect pages. The href attribute specifies the destination URL.',
          difficulty: 'Beginner',
          marks: 10,
          tags: ['html', 'basics'],
          time_estimate_seconds: 60
        },
        {
          id: 'p2',
          type: 'MCQ',
          question: 'Which doctype declaration is correct for HTML5?',
          options: ['<!DOCTYPE HTML5>', '<!DOCTYPE html>', '<!doctype html5>', '<!DOCTYPE HTML>'],
          correct_answer: '<!DOCTYPE html>',
          explanation: 'In HTML5, the doctype declaration is case-insensitive and is simply written as <!DOCTYPE html> to enable standard rendering mode.',
          difficulty: 'Beginner',
          marks: 10,
          tags: ['html', 'syntax'],
          time_estimate_seconds: 45
        }
      ];
    }
    // HTML Semantic Layout
    else if (chId === '22222222-2222-2222-2222-222222222222') {
      list = [
        {
          id: 'p3',
          type: 'FILL_IN_BLANKS',
          question: 'The semantic tag used to define navigation links is ________.',
          options: ['<nav>'],
          correct_answer: '<nav>',
          explanation: 'The <nav> element represents a section of a page whose purpose is to provide navigation links, either within the current document or to other documents.',
          difficulty: 'Beginner',
          marks: 10,
          tags: ['semantics', 'accessibility'],
          time_estimate_seconds: 60
        }
      ];
    }
    // CSS Box Model
    else if (chId === '33333333-3333-3333-3333-333333333333') {
      list = [
        {
          id: 'p4',
          type: 'TRUE_FALSE',
          question: 'Setting box-sizing to border-box means that padding and borders are added to the outer dimensions of the element, making it larger.',
          options: ['True', 'False'],
          correct_answer: 'False',
          explanation: 'Setting box-sizing to border-box incorporates the padding and borders inside the declared width/height, keeping the total rendered box dimensions constant.',
          difficulty: 'Intermediate',
          marks: 10,
          tags: ['css', 'box-model'],
          time_estimate_seconds: 50
        }
      ];
    }
    // JS Scope
    else if (chId === '44444444-4444-4444-4444-444444444444') {
      list = [
        {
          id: 'p5',
          type: 'PREDICT_OUTPUT',
          question: 'What is the output of the following code?\n```js\nfunction test() {\n  var x = 1;\n  if (true) {\n    var x = 2;\n    console.log(x);\n  }\n  console.log(x);\n}\ntest();\n```',
          options: ['2 then 1', '2 then 2', '1 then 2', 'undefined'],
          correct_answer: '2 then 2',
          explanation: 'Since "var" is function-scoped rather than block-scoped, redeclaring "var x" inside the block overwrites the variable "x" in the same function scope, so both logs print 2.',
          difficulty: 'Intermediate',
          marks: 15,
          tags: ['js', 'scope', 'var'],
          time_estimate_seconds: 90
        }
      ];
    } else {
      // Fallback questions for auto-generated placeholder chapters
      list = [
        {
          id: 'pf-1',
          type: 'MCQ',
          question: `Regarding the chapter, which statement represents the core design standard?`,
          options: [
            'All layouts must prioritize clean component hierarchies.',
            'Inline styling should be applied to maximize layout control.',
            'Global scopes must be used for sharing controller configurations.',
            'None of the above.'
          ],
          correct_answer: 'All layouts must prioritize clean component hierarchies.',
          explanation: 'Standard practices dictate using descriptive class files and decoupled structures rather than inline overrides or global scope pollution.',
          difficulty: 'Beginner',
          marks: 10,
          tags: ['general', 'best-practices'],
          time_estimate_seconds: 60
        }
      ];
    }

    this.questions = list;
  }

  resetQuestionState(): void {
    this.selectedAnswer = '';
    this.checked = false;
    this.isCorrect = false;
    this.xpAwarded = false;
  }

  selectOption(opt: string): void {
    if (this.checked) return;
    this.selectedAnswer = opt;
  }

  checkAnswer(): void {
    if (!this.selectedAnswer || this.checked) return;
    
    this.checked = true;
    const currentQ = this.questions[this.activeIdx];
    
    this.isCorrect = this.selectedAnswer.trim().toLowerCase() === currentQ.correct_answer.trim().toLowerCase();

    if (this.isCorrect && !this.xpAwarded) {
      this.xpAwarded = true;
      this.progressService.awardXP(20, 'Practice Question Correct');
    }
  }

  nextQuestion(): void {
    if (this.activeIdx < this.questions.length - 1) {
      this.activeIdx++;
      this.resetQuestionState();
    }
  }

  prevQuestion(): void {
    if (this.activeIdx > 0) {
      this.activeIdx--;
      this.resetQuestionState();
    }
  }
}
