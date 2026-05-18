import { inject, Injectable } from "@angular/core";
import { DEFAULT_MUS_STATE, MUS_MAX_SCORE, MUS_STORAGE_KEY } from "../models/mus.domain";
import { MusCategoryKey, MusHistoryEntry, MusState, Team } from "../models/mus.types";
import { GameSessionService } from "../../../core/services/game-session.service";

@Injectable({
  providedIn: 'root'
})
export class MusService {
  private sessionService = inject(GameSessionService);
  state: MusState = this.loadSavedGame();
  private history: MusHistoryEntry[] = [];

  private loadSavedGame(): MusState {
    const saved = this.sessionService.loadGame<MusState>(MUS_STORAGE_KEY);
    if (!saved) {
      return this.cloneState(DEFAULT_MUS_STATE);
    }

    return {
      scores: [saved.scores?.[0] ?? 0, saved.scores?.[1] ?? 0],
      categoryValues: {
        grande: saved.categoryValues?.grande ?? 0,
        chica: saved.categoryValues?.chica ?? 0,
        pares: saved.categoryValues?.pares ?? 0,
        juego: saved.categoryValues?.juego ?? 0,
        puntos: saved.categoryValues?.puntos ?? 0
      }
    };
  }

  private cloneState(state: MusState): MusState {
    return {
      scores: [...state.scores] as [number, number],
      categoryValues: { ...state.categoryValues }
    };
  }

  private persist() {
    this.sessionService.saveGame(MUS_STORAGE_KEY, this.state);
  }

  private saveHistory() {
    this.history.push(this.cloneState(this.state));
  }

  private deleteHistory() {
    this.history = [];
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  undo() {
    const previousState = this.history.pop();
    if (!previousState) {
      return;
    }

    this.state = this.cloneState(previousState);
    this.persist();
  }

  addPoint(team: Team, amount = 1) {
    if (amount <= 0 || this.state.scores[team] >= MUS_MAX_SCORE) {
      return;
    }

    this.saveHistory();
    this.state = {
      ...this.state,
      scores: this.state.scores.map((score, index) => index === team ? Math.min(MUS_MAX_SCORE, score + amount) : score) as [number, number]
    };
    this.persist();
  }

  removePoint(team: Team, amount = 1) {
    if (amount <= 0 || this.state.scores[team] <= 0) {
      return;
    }

    this.saveHistory();
    this.state = {
      ...this.state,
      scores: this.state.scores.map((score, index) => index === team ? Math.max(0, score - amount) : score) as [number, number]
    };
    this.persist();
  }

  addCategoryPoint(category: MusCategoryKey, amount = 1) {
    if (amount <= 0) {
      return;
    }

    this.saveHistory();
    this.state = {
      ...this.state,
      categoryValues: {
        ...this.state.categoryValues,
        [category]: this.state.categoryValues[category] + amount
      }
    };
    this.persist();
  }

  removeCategoryPoint(category: MusCategoryKey, amount = 1) {
    if (amount <= 0 || this.state.categoryValues[category] <= 0) {
      return;
    }

    this.saveHistory();
    this.state = {
      ...this.state,
      categoryValues: {
        ...this.state.categoryValues,
        [category]: Math.max(0, this.state.categoryValues[category] - amount)
      }
    };
    this.persist();
  }

  awardCategory(category: MusCategoryKey, team: Team) {
    const amount = this.state.categoryValues[category];
    if (amount <= 0) {
      return;
    }

    this.saveHistory();
    this.state = {
      scores: this.state.scores.map((score, index) => index === team ? Math.min(MUS_MAX_SCORE, score + amount) : score) as [number, number],
      categoryValues: {
        ...this.state.categoryValues,
        [category]: 0
      }
    };
    this.persist();
  }

  reset() {
    this.deleteHistory();
    this.state = this.cloneState(DEFAULT_MUS_STATE);
    this.sessionService.clearGame(MUS_STORAGE_KEY);
  }
}