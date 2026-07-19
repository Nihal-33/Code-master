import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./features/courses/courses-list/courses-list.component').then(m => m.CoursesListComponent)
      },
      {
        path: 'courses/:slug',
        loadComponent: () => import('./features/courses/course-chapters/course-chapters.component').then(m => m.CourseChaptersComponent)
      },
      {
        path: 'ebook/:chapterId',
        loadComponent: () => import('./features/ebook/ebook-reader/ebook-reader.component').then(m => m.EbookReaderComponent)
      },
      {
        path: 'practice',
        loadComponent: () => import('./features/practice/practice-arena/practice-arena.component').then(m => m.PracticeArenaComponent)
      },
      {
        path: 'quiz',
        loadComponent: () => import('./features/quiz/quiz-arena/quiz-arena.component').then(m => m.QuizArenaComponent)
      },
      {
        path: 'quiz/:quizId',
        loadComponent: () => import('./features/quiz/active-quiz/active-quiz.component').then(m => m.ActiveQuizComponent)
      },
      {
        path: 'challenges',
        loadComponent: () => import('./features/challenges/challenges-list/challenges-list.component').then(m => m.ChallengesListComponent)
      },
      {
        path: 'challenges/:challengeId',
        loadComponent: () => import('./features/challenges/active-challenge/active-challenge.component').then(m => m.ActiveChallengeComponent)
      },
      {
        path: 'bookmarks',
        loadComponent: () => import('./features/bookmarks/bookmarks.component').then(m => m.BookmarksComponent)
      },
      {
        path: 'notes',
        loadComponent: () => import('./features/notes/notes.component').then(m => m.NotesComponent)
      },
      {
        path: 'certificates',
        loadComponent: () => import('./features/certificates/certificates.component').then(m => m.CertificatesComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'landing'
  }
];
