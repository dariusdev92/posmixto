import { Component, inject, Injectable, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSessionService } from '../../../../core/services/game-session.service';
import { actionClickTrigger, LayoutService } from '../../../../layout/layout.service';
import { PalitosComponent } from '../../../../core/components/palitos/palitos.component';

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

@Component({
  selector: 'app-truco',
  standalone: true,
  imports: [CommonModule, PalitosComponent],
  template: `
    <div class="flex flex-col h-full bg-background text-foreground">
      <main class="flex-1 overflow-hidden relative touch-none select-none bg-zinc-900 text-zinc-100 grid grid-cols-[1fr_4px_1fr] pb-4 border border-border mx-auto w-full">
        <!-- Team 1 Side -->
        <div 
          class="h-full cursor-pointer grid grid-rows-[1fr_auto_1fr] py-4 sm:px-8"
          (click)="addPoint(0)"
          (contextmenu)="removePoint($event, 0)"
        >
          <!-- Malas -->
          <div class="grid grid-cols-1 place-items-center gap-4">
            @for (stick of getSticks(scores[0] > 15 ? 15 : scores[0]); track $index) {
              <app-palitos [count]="stick"></app-palitos>
            }
          </div>
          
          <!-- Midline Divider -->
          <div class="w-full h-1 bg-zinc-700 my-4 opacity-50"></div>
  
          <!-- Buenas -->
          <div class="grid grid-cols-1 place-items-center gap-4">
            @for (stick of getSticks(Math.max(0, scores[0] - 15)); track $index) {
              <app-palitos [count]="stick"></app-palitos>
            }
          </div>
        </div>
  
        <!-- Vertical Divider separating teams -->
        <div class="w-full h-full bg-zinc-500"></div>
  
        <!-- Team 2 Side -->
        <div 
          class="h-full cursor-pointer grid grid-rows-[1fr_auto_1fr] py-4 sm:px-8"
          (click)="addPoint(1)"
          (contextmenu)="removePoint($event, 1)"
        >
          <!-- Malas -->
          <div class="grid grid-cols-1 place-items-center gap-4">
            @for (stick of getSticks(scores[1] > 15 ? 15 : scores[1]); track $index) {
              <app-palitos [count]="stick"></app-palitos>
            }
          </div>
          
          <!-- Midline Divider -->
          <div class="w-full h-1 bg-zinc-700 my-4 opacity-50"></div>
  
          <!-- Buenas -->
          <div class="grid grid-cols-1 place-items-center gap-4">
            @for (stick of getSticks(Math.max(0, scores[1] - 15)); track $index) {
              <app-palitos [count]="stick"></app-palitos>
            }
          </div>
        </div>
      </main>
    </div>
  `
})
export class TrucoComponent {
  private trucoService = inject(TrucoService);
  private layoutService = inject(LayoutService);
  Math = Math;

  constructor() {
    // Listen to layout action clicks for reset
    effect(() => {
      const action = actionClickTrigger();
      if (action === 'reset') {
        this.reset();
        this.layoutService.resetActionTrigger();
      }
    });
  }

  get scores(): [number, number] {
    return this.trucoService.scores;
  }

  addPoint(team: 0 | 1) {
    this.trucoService.addPoint(team);
  }

  removePoint(event: Event, team: 0 | 1) {
    event.preventDefault(); // Prevent context menu
    this.trucoService.removePoint(team);
  }

  reset() {
    this.trucoService.reset();
  }

  // Returns an array of numbers representing palitos for a half (0 to 15 points)
  // Always returns exactly 3 elements to preserve deterministic flex/grid alignment layout.
  getSticks(points: number): number[] {
    const p1 = Math.min(5, Math.max(0, points));
    const p2 = Math.min(5, Math.max(0, points - 5));
    const p3 = Math.min(5, Math.max(0, points - 10));
    return [p1, p2, p3];
  }
}
