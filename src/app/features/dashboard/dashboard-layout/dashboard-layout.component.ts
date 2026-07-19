import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserProfile } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  user: UserProfile | null = null;
  sidebarOpen = false;

  // Sidebar navigation options
  navItems = [
    { label: 'Home Dashboard', path: '/dashboard', exact: true, icon: 'home' },
    { label: 'My Courses', path: '/dashboard/courses', exact: false, icon: 'book' },
    { label: 'Practice Arena', path: '/dashboard/practice', exact: false, icon: 'target' },
    { label: 'Quiz Arena', path: '/dashboard/quiz', exact: false, icon: 'trophy' },
    { label: 'Coding Challenges', path: '/dashboard/challenges', exact: false, icon: 'terminal' },
    { label: 'Bookmarks', path: '/dashboard/bookmarks', exact: false, icon: 'bookmark' },
    { label: 'Notes Manager', path: '/dashboard/notes', exact: false, icon: 'edit' },
    { label: 'Certificates', path: '/dashboard/certificates', exact: false, icon: 'award' },
    { label: 'My Profile', path: '/dashboard/profile', exact: false, icon: 'user' },
    { label: 'Settings', path: '/dashboard/settings', exact: false, icon: 'settings' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(profile => {
      this.user = profile;
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/landing']);
    });
  }
}
