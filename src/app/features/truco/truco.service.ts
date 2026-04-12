import { Injectable, inject } from '@angular/core';
import { GameSessionService } from '../../common/services/game-session.service';

const TRUCO_STORAGE_KEY = 'PWA_TRUCO_STATE';

@Injectable({
  providedIn: 'root'
})
export class TrucoService {
  private sessionService = inject(GameSessionService);
  scores: [number, number] = [0, 0];

  constructor() {
    this.loadSavedGame();
  }

  private loadSavedGame() {
    const saved = this.sessionService.loadGame<[number, number]>(TRUCO_STORAGE_KEY);
    if (saved) {
      this.scores = saved;
    }
  }

  private persist() {
    this.sessionService.saveGame(TRUCO_STORAGE_KEY, this.scores);
  }

  addPoint(team: 0 | 1) {
    if (this.scores[team] < 30) {
      this.scores[team]++;
      this.persist();
    }
  }

  removePoint(team: 0 | 1) {
    if (this.scores[team] > 0) {
      this.scores[team]--;
      this.persist();
    }
  }

  reset() {
    this.scores = [0, 0];
    this.sessionService.clearGame(TRUCO_STORAGE_KEY);
  }
}
