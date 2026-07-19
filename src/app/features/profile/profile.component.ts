import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserProfile } from '../../core/services/auth.service';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgGrad: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: UserProfile | null = null;
  
  badges: Badge[] = [
    { id: 'First Chapter', name: 'First Chapter', description: 'Read and completed your first study chapter.', icon: '📖', bgGrad: 'from-blue-500 to-indigo-600' },
    { id: '7-Day Streak', name: '7-Day Streak', description: 'Maintained a study streak of 7 days or more.', icon: '🔥', bgGrad: 'from-orange-500 to-red-600' },
    { id: 'Quiz Master', name: 'Quiz Master', description: 'Scored 100% accuracy on a timed challenge.', icon: '🎯', bgGrad: 'from-emerald-500 to-teal-600' },
    { id: 'JavaScript Ninja', name: 'JavaScript Ninja', description: 'Scored over 80% accuracy on JS challenges.', icon: '🥷', bgGrad: 'from-yellow-400 to-amber-600' },
    { id: 'Angular Explorer', name: 'Angular Explorer', description: 'Started the AngularJS architecture track.', icon: '🅰️', bgGrad: 'from-red-600 to-pink-700' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((profile: UserProfile | null) => {
      this.user = profile;
    });
  }

  isBadgeUnlocked(badgeId: string): boolean {
    if (!this.user) return false;
    return this.user.achievements.includes(badgeId);
  }
}
