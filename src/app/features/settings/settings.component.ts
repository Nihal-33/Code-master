import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserProfile } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: UserProfile | null = null;
  fullName = '';
  avatarSeed = '';
  soundEnabled = true;
  
  saveMsg = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((profile: UserProfile | null) => {
      if (profile) {
        this.user = profile;
        this.fullName = profile.full_name;
        // Parse avatar seed if dicebear is used, or assign random
        this.avatarSeed = profile.avatar_url?.split('seed=')[1] || 'CodeMaster';
      }
    });

    // Load sound settings from localStorage
    const soundOpt = localStorage.getItem('codemaster_sound_enabled');
    this.soundEnabled = soundOpt === null ? true : soundOpt === 'true';
  }

  saveSettings(): void {
    if (!this.user) return;

    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${this.avatarSeed.trim()}`;
    
    // Save sound preference
    localStorage.setItem('codemaster_sound_enabled', String(this.soundEnabled));

    this.authService.updateProfile({
      full_name: this.fullName,
      avatar_url: avatarUrl
    }).subscribe({
      next: () => {
        this.saveMsg = 'Preferences saved successfully!';
        setTimeout(() => this.saveMsg = '', 3000);
      },
      error: (err: any) => {
        console.error('Error saving profile settings', err);
      }
    });
  }
}
