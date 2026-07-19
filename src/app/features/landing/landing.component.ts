import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  // Mock previews of courses matching the core dataset
  courses = [
    {
      title: 'HTML5 Mastery',
      slug: 'html5-mastery',
      chapters: 11,
      questions: 20,
      quizzes: 2,
      difficulty: 'Beginner',
      bgGrad: 'from-orange-500 to-red-600',
      iconPath: 'M12 2L2 22h20L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z'
    },
    {
      title: 'CSS3 & Modern Layouts',
      slug: 'css3-layouts',
      chapters: 12,
      questions: 22,
      quizzes: 2,
      difficulty: 'Intermediate',
      bgGrad: 'from-blue-500 to-indigo-600',
      iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z'
    },
    {
      title: 'JavaScript Deep Dive',
      slug: 'javascript-deep-dive',
      chapters: 15,
      questions: 25,
      quizzes: 3,
      difficulty: 'Advanced',
      bgGrad: 'from-yellow-400 to-amber-600',
      iconPath: 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z'
    },
    {
      title: 'Legacy & Modern AngularJS',
      slug: 'angularjs-essentials',
      chapters: 13,
      questions: 18,
      quizzes: 2,
      difficulty: 'Advanced',
      bgGrad: 'from-red-600 to-pink-700',
      iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
    }
  ];

  features = [
    { title: 'Interactive E-Books', desc: 'Read topic-wise study notes enriched with syntax highlighted code samples and sandbox exercises.', icon: 'book-open' },
    { title: 'Topic-wise Questions', desc: 'Engage with MCQs, Output Prediction, Debug Code, and Fill-in-the-Blanks after every chapter.', icon: 'help-circle' },
    { title: 'AI Practice Mode', desc: 'Get explanation notes, customized difficulty scaling, and automated guidance systems.', icon: 'cpu' },
    { title: 'Quiz Arena', desc: 'Compete in Quick, Timed, or Daily challenges, earn XP multipliers, and rise on global leaderboards.', icon: 'trophy' },
    { title: 'Progress Tracking', desc: 'Visualize your accomplishments, streaks, completion percentages, and level promotions.', icon: 'trending-up' },
    { title: 'Bookmark & Notes', desc: 'Highlighters, bookmarks, and rich text note taking with the ability to export study materials as PDF.', icon: 'edit' },
    { title: 'Certificates', desc: 'Earn verifiable digital completion credentials for individual courses and the Frontend Career Path.', icon: 'award' },
    { title: 'Dark Mode by Default', desc: 'Stunning Slate-900 typography, interactive glass cards, and optimized screen ergonomics.', icon: 'moon' }
  ];

  roadmap = [
    { phase: 'Beginner', title: 'HTML5 & Document Skeleton', desc: 'Understand semantic layouts, anchor linking, media loaders, and screen accessibility standards.' },
    { phase: 'Intermediate', title: 'CSS3 Flexbox, Grids & Variables', desc: 'Develop beautiful, responsive interfaces utilizing fluid layouts, variables, and CSS transitions.' },
    { phase: 'Advanced', title: 'JavaScript Engine & Async API', desc: 'Dive into closures, prototypes, Event Loops, fetch actions, and Local Storage management.' },
    { phase: 'Project Builder', title: 'Single Page App Paradigms', desc: 'Understand MVC controllers, custom directives, DI, and routes using AngularJS principles.' },
    { phase: 'Job Ready', title: 'Mock Interviews & Challenges', desc: 'Solve real-world frontend challenges, predict code outputs, and claim your course certificates!' }
  ];

  faqs = [
    { question: 'What technologies can I learn on CodeMaster?', answer: 'We offer specialized interactive tracks for HTML5, CSS3, JavaScript (ES6+), and AngularJS (both legacy concepts and upgrade paths).', open: false },
    { question: 'How does the XP and Leveling system work?', answer: 'You earn XP for every milestone: +10 XP for reading a chapter, +20 XP for submitting practice, +50 XP for passing quizzes. Level ranks scale from Beginner to Master.', open: false },
    { question: 'Can I export my study notes?', answer: 'Yes! Our digital reader allows taking notes on any chapter. You can edit, search, and export notes as a print-ready PDF at any time.', open: false },
    { question: 'Are the course certificates verifiable?', answer: 'Absolutely. Every certificate is issued with a unique code (e.g. CM-HTML5-XXXX) and recipient record searchable on our platform.', open: false }
  ];

  mobileMenuOpen = false;

  toggleFaq(idx: number): void {
    this.faqs[idx].open = !this.faqs[idx].open;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  scrollToSection(sectionId: string): void {
    this.mobileMenuOpen = false;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
