import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeService, CodingChallenge, ExecutionResult } from '../../../core/services/challenge.service';

@Component({
  selector: 'app-active-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './active-challenge.component.html',
  styleUrls: ['./active-challenge.component.css']
})
export class ActiveChallengeComponent implements OnInit {
  challenge: CodingChallenge | null = null;
  userCode = '';
  
  // Execution statuses
  running = false;
  results: ExecutionResult | null = null;
  activeHintIdx = -1;

  constructor(
    private route: ActivatedRoute,
    private challengeService: ChallengeService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const challengeId = params.get('challengeId');
      if (challengeId) {
        this.loadChallenge(challengeId);
      }
    });
  }

  loadChallenge(id: string): void {
    this.challengeService.getChallengeById(id).subscribe(chal => {
      if (chal) {
        this.challenge = chal;
        this.userCode = chal.initialCode;
        this.results = null;
        this.activeHintIdx = -1;
      }
    });
  }

  // Generate line numbers helper array
  get lineNumbers(): number[] {
    const lines = this.userCode.split('\n').length;
    return Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1);
  }

  runCode(): void {
    if (!this.challenge) return;
    this.running = true;
    this.results = null;

    setTimeout(() => {
      this.challengeService.runChallenge(this.challenge!.id, this.userCode).subscribe(res => {
        this.results = res;
        this.running = false;
      });
    }, 800); // Simulate execution delay
  }

  showNextHint(): void {
    if (!this.challenge) return;
    if (this.activeHintIdx < this.challenge.hints.length - 1) {
      this.activeHintIdx++;
    }
  }

  resetCode(): void {
    if (this.challenge) {
      this.userCode = this.challenge.initialCode;
      this.results = null;
      this.activeHintIdx = -1;
    }
  }
}
