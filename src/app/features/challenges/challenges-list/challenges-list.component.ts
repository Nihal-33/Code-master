import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChallengeService, CodingChallenge } from '../../../core/services/challenge.service';

@Component({
  selector: 'app-challenges-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './challenges-list.component.html',
  styleUrls: ['./challenges-list.component.css']
})
export class ChallengesListComponent implements OnInit {
  challenges: CodingChallenge[] = [];

  constructor(private challengeService: ChallengeService) {}

  ngOnInit(): void {
    this.challengeService.getChallenges().subscribe(list => {
      this.challenges = list;
    });
  }
}
