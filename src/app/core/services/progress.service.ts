import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { AuthService, UserProfile } from './auth.service';

export interface UserProgress {
  id?: string;
  user_id: string;
  chapter_id: string;
  completed: boolean;
  reading_percentage: number;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  // Fetch progress records for current user
  public getProgress(): Observable<UserProgress[]> {
    const user = this.authService.currentUserValue;
    if (!user) return of([]);

    if (this.supabaseService.isMockMode) {
      const progress = localStorage.getItem(`codemaster_progress_${user.id}`);
      return of(progress ? JSON.parse(progress) : []);
    }

    return from(
      this.supabaseService.client
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as UserProgress[];
      })
    );
  }

  // Update progress for a chapter
  public updateChapterProgress(chapterId: string, readingPercentage: number, completed: boolean): Observable<UserProgress> {
    const user = this.authService.currentUserValue;
    if (!user) throw new Error('User not logged in');

    const progressRecord: UserProgress = {
      user_id: user.id,
      chapter_id: chapterId,
      completed,
      reading_percentage: readingPercentage
    };

    if (this.supabaseService.isMockMode) {
      const key = `codemaster_progress_${user.id}`;
      const saved = localStorage.getItem(key);
      const list: UserProgress[] = saved ? JSON.parse(saved) : [];
      
      const index = list.findIndex(p => p.chapter_id === chapterId);
      let isFirstTimeCompleted = false;

      if (index > -1) {
        if (!list[index].completed && completed) {
          isFirstTimeCompleted = true;
        }
        list[index] = { ...list[index], reading_percentage: Math.max(list[index].reading_percentage, readingPercentage), completed: list[index].completed || completed };
      } else {
        list.push(progressRecord);
        if (completed) {
          isFirstTimeCompleted = true;
        }
      }

      localStorage.setItem(key, JSON.stringify(list));

      // Award XP on first time completion or reading progress thresholds
      if (isFirstTimeCompleted) {
        this.awardXP(10, 'Chapter Completed!');
        this.checkAchievementsAfterChapter(chapterId, list.filter(p => p.completed).length);
      }

      this.updateStreak();

      return of(progressRecord);
    }

    // Supabase Mode
    return from(
      this.supabaseService.client
        .from('progress')
        .upsert(progressRecord, { onConflict: 'user_id,chapter_id' })
        .select()
        .single()
    ).pipe(
      map(res => {
        if (res.error) throw res.error;
        return res.data as UserProgress;
      }),
      tap((record) => {
        if (completed) {
          // Check if we need to award XP and check achievements
          // For simplicity, we can do it after verifying or checking achievements
          this.awardXP(10, 'Chapter Completed!');
          this.updateStreak();
        }
      })
    );
  }

  // Award XP to user
  public awardXP(amount: number, reason: string): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const newXP = user.xp + amount;
    
    // Check if new level is reached
    const currentLevel = user.level;
    this.authService.updateProfile({ xp: newXP }).subscribe(updatedProfile => {
      if (updatedProfile.level !== currentLevel) {
        console.log(`Level Up! You are now a ${updatedProfile.level}!`);
        // We can show level up notifications in components subscribing to AuthService
      }
    });
  }

  // Update User Active Streak
  public updateStreak(): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastActivity = user.last_activity_date;

    if (lastActivity === todayStr) {
      return; // Already active today, streak remains same
    }

    let newStreak = user.current_streak;
    let newMax = user.max_streak;

    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
        this.awardXP(25, 'Daily Streak Bonus!');
      } else if (diffDays > 1) {
        newStreak = 1; // Reset streak
      }
    } else {
      newStreak = 1; // First activity
    }

    if (newStreak > newMax) {
      newMax = newStreak;
    }

    const updates: Partial<UserProfile> = {
      current_streak: newStreak,
      max_streak: newMax,
      last_activity_date: todayStr
    };

    // Unlock "7-Day Streak" Achievement if eligible
    if (newMax >= 7 && !user.achievements.includes('7-Day Streak')) {
      updates.achievements = [...user.achievements, '7-Day Streak'];
      this.awardXP(50, 'Achievement Unlocked: 7-Day Streak!');
    }

    this.authService.updateProfile(updates).subscribe();
  }

  // Check achievements related to reading chapters
  private checkAchievementsAfterChapter(chapterId: string, completedChaptersCount: number): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const newAchievements = [...user.achievements];
    let unlocked = false;

    if (completedChaptersCount >= 1 && !newAchievements.includes('First Chapter')) {
      newAchievements.push('First Chapter');
      unlocked = true;
      this.awardXP(30, 'Achievement Unlocked: First Chapter!');
    }

    // Check specific courses
    if (chapterId.startsWith('angular') && !newAchievements.includes('Angular Explorer')) {
      newAchievements.push('Angular Explorer');
      unlocked = true;
      this.awardXP(30, 'Achievement Unlocked: Angular Explorer!');
    }

    if (unlocked) {
      this.authService.updateProfile({ achievements: newAchievements }).subscribe();
    }
  }

  // Unlock arbitrary achievement
  public unlockAchievement(achievementName: string): void {
    const user = this.authService.currentUserValue;
    if (!user || user.achievements.includes(achievementName)) return;

    const newAchievements = [...user.achievements, achievementName];
    this.authService.updateProfile({ achievements: newAchievements }).subscribe(() => {
      this.awardXP(50, `Achievement Unlocked: ${achievementName}!`);
    });
  }

  // Save completed practice question to local storage (for both mock and live modes persistence)
  public completePracticeQuestion(chapterId: string, questionId: string): void {
    const user = this.authService.currentUserValue;
    if (!user) return;

    const key = `codemaster_practice_progress_${user.id}`;
    const saved = localStorage.getItem(key);
    const progress: { [chapterId: string]: string[] } = saved ? JSON.parse(saved) : {};

    if (!progress[chapterId]) {
      progress[chapterId] = [];
    }

    if (!progress[chapterId].includes(questionId)) {
      progress[chapterId].push(questionId);
      localStorage.setItem(key, JSON.stringify(progress));
    }
  }

  // Get completed practice questions for a chapter
  public getCompletedPracticeQuestions(chapterId: string): string[] {
    const user = this.authService.currentUserValue;
    if (!user) return [];

    const key = `codemaster_practice_progress_${user.id}`;
    const saved = localStorage.getItem(key);
    const progress: { [chapterId: string]: string[] } = saved ? JSON.parse(saved) : {};

    return progress[chapterId] || [];
  }

  // Get total practice questions count defined for a chapter
  public getChapterPracticeQuestionsCount(chapterId: string): number {
    if (chapterId === '11111111-1111-1111-1111-111111111111') return 2;
    return 1;
  }
}
