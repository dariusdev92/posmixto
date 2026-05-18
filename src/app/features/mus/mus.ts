import { CommonModule } from '@angular/common';
import { Component, HostListener, Injectable, effect, inject, signal } from '@angular/core';
import { GameSessionService } from '../../core/services/game-session';
import { PalitosComponent } from '../../core/components/palitos/palitos';
import { actionClickTrigger, LayoutService } from '../../layout/layout.service';

const MUS_STORAGE_KEY = 'PWA_MUS_STATE';
const MUS_MAX_SCORE = 40;
const LONG_PRESS_MS = 450;
const DRAG_THRESHOLD_PX = 8;

type Team = 0 | 1;
type MusCategoryKey = 'grande' | 'chica' | 'pares' | 'juego' | 'puntos';

interface MusState {
  scores: [number, number];
  categoryValues: Record<MusCategoryKey, number>;
}

interface MusCategoryDefinition {
  key: MusCategoryKey;
  shortLabel: string;
}

interface PendingCategoryPointer {
  category: MusCategoryKey;
  pointerId: number;
  x: number;
  y: number;
}

type MusHistoryEntry = MusState;

const DEFAULT_MUS_STATE: MusState = {
  scores: [0, 0],
  categoryValues: {
    grande: 0,
    chica: 0,
    pares: 0,
    juego: 0,
    puntos: 0
  }
};

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
    this.saveHistory();
    this.state = this.cloneState(DEFAULT_MUS_STATE);
    this.sessionService.clearGame(MUS_STORAGE_KEY);
  }
}

@Component({
  selector: 'app-mus',
  standalone: true,
  imports: [CommonModule, PalitosComponent],
  template: `
    <div class="flex h-full touch-none bg-black text-white" (contextmenu)="$event.preventDefault()">
      <main class="grid min-h-0 flex-1 grid-cols-[minmax(0,1.7fr)_minmax(11rem,1fr)] border border-white touch-none">
        <section class="grid min-h-0 grid-cols-[1fr_2px_1fr]">
          <div
            data-team-zone
            data-team-id="0"
            class="grid min-h-0 cursor-pointer grid-rows-[1fr_auto_1fr] p-4 transition-colors sm:p-6"
            [class.bg-white]="hoveredDropTeam() === 0"
            [class.text-black]="hoveredDropTeam() === 0"
            [class.opacity-60]="winnerTeam() === 1"
            (click)="handleTeamTap(0)"
            (pointerdown)="startTeamLongPress(0)"
            (pointerup)="cancelLongPress()"
            (pointerleave)="cancelLongPress()"
            (pointercancel)="cancelLongPress()"
          >
            <div class="flex flex-col items-center justify-center gap-2 sm:gap-3">
              @for (stick of getSticks(getFirstHalfScore(scores[0])); track $index) {
                <app-palitos [count]="stick" sizeClass="h-9 w-9 sm:h-10 sm:w-10" [activeClass]="hoveredDropTeam() === 0 ? 'bg-black' : 'bg-white'"></app-palitos>
              }
            </div>

            <div class="my-4 h-0.5 w-full" [class.bg-black]="hoveredDropTeam() === 0" [class.bg-white]="hoveredDropTeam() !== 0"></div>

            <div class="flex flex-col items-center justify-center gap-2 sm:gap-3">
              @for (stick of getSticks(getSecondHalfScore(scores[0])); track $index) {
                <app-palitos [count]="stick" sizeClass="h-9 w-9 sm:h-10 sm:w-10" [activeClass]="hoveredDropTeam() === 0 ? 'bg-black' : 'bg-white'"></app-palitos>
              }
            </div>
          </div>

          <div class="h-full w-full bg-white"></div>

          <div
            data-team-zone
            data-team-id="1"
            class="grid min-h-0 cursor-pointer grid-rows-[1fr_auto_1fr] p-4 transition-colors sm:p-6"
            [class.bg-white]="hoveredDropTeam() === 1"
            [class.text-black]="hoveredDropTeam() === 1"
            [class.opacity-60]="winnerTeam() === 0"
            (click)="handleTeamTap(1)"
            (pointerdown)="startTeamLongPress(1)"
            (pointerup)="cancelLongPress()"
            (pointerleave)="cancelLongPress()"
            (pointercancel)="cancelLongPress()"
          >
            <div class="flex flex-col items-center justify-center gap-2 sm:gap-3">
              @for (stick of getSticks(getFirstHalfScore(scores[1])); track $index) {
                <app-palitos [count]="stick" sizeClass="h-9 w-9 sm:h-10 sm:w-10" [activeClass]="hoveredDropTeam() === 1 ? 'bg-black' : 'bg-white'"></app-palitos>
              }
            </div>

            <div class="my-4 h-0.5 w-full" [class.bg-black]="hoveredDropTeam() === 1" [class.bg-white]="hoveredDropTeam() !== 1"></div>

            <div class="flex flex-col items-center justify-center gap-2 sm:gap-3">
              @for (stick of getSticks(getSecondHalfScore(scores[1])); track $index) {
                <app-palitos [count]="stick" sizeClass="h-9 w-9 sm:h-10 sm:w-10" [activeClass]="hoveredDropTeam() === 1 ? 'bg-black' : 'bg-white'"></app-palitos>
              }
            </div>
          </div>
        </section>

        <aside class="grid min-h-0 grid-rows-5 border-l-2 border-white">
          @for (category of categories; track category.key) {
            <div
              class="grid cursor-pointer grid-cols-[4.5rem_1fr] border-b border-white select-none last:border-b-0"
              (click)="addCategoryPoint(category.key)"
              (pointerdown)="startCategoryInteraction($event, category.key)"
            >
              <div class="flex items-center justify-center border-r border-white text-lg font-semibold tracking-wide">
                {{ category.shortLabel }}
              </div>

              <div class="relative flex items-center justify-center text-3xl font-bold">
                {{ categoryValue(category.key) }}
              </div>
            </div>
          }
        </aside>
      </main>
    </div>
  `
})
export class MusComponent {
  private musService = inject(MusService);
  private layoutService = inject(LayoutService);

  readonly categories: MusCategoryDefinition[] = [
    { key: 'grande', shortLabel: 'G' },
    { key: 'chica', shortLabel: 'C' },
    { key: 'pares', shortLabel: 'P' },
    { key: 'juego', shortLabel: 'J' },
    { key: 'puntos', shortLabel: 'Pts' }
  ];

  readonly hoveredDropTeam = signal<Team | null>(null);

  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private longPressHandled = false;
  private dragHandled = false;
  private activeDraggedCategory: MusCategoryKey | null = null;
  private pendingCategoryPointer: PendingCategoryPointer | null = null;

  constructor() {
    this.syncHeaderActions();

    effect(() => {
      const current = actionClickTrigger();
      if (current.count <= 0) {
        return;
      }

      if (current.action === 'undo') {
        this.undo();
        return;
      }

      if (current.action === 'reset') {
        this.confirmReset();
      }
    });
  }

  get scores(): [number, number] {
    return this.musService.state.scores;
  }

  winnerTeam(): Team | null {
    if (this.scores[0] >= MUS_MAX_SCORE) {
      return 0;
    }

    if (this.scores[1] >= MUS_MAX_SCORE) {
      return 1;
    }

    return null;
  }

  categoryValue(category: MusCategoryKey): number {
    return this.musService.state.categoryValues[category];
  }

  addCategoryPoint(category: MusCategoryKey) {
    if (this.consumeLongPress() || this.consumeDrag()) {
      return;
    }

    this.musService.addCategoryPoint(category);
    this.syncHeaderActions();
  }

  handleTeamTap(team: Team) {
    if (this.consumeLongPress() || this.consumeDrag()) {
      return;
    }

    this.musService.addPoint(team);
    this.syncHeaderActions();
  }

  startCategoryInteraction(event: PointerEvent, category: MusCategoryKey) {
    (event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
    this.dragHandled = false;
    this.pendingCategoryPointer = {
      category,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };

    this.beginLongPress(() => {
      this.musService.removeCategoryPoint(category);
      this.pendingCategoryPointer = null;
      this.clearCategoryDragState();
      this.syncHeaderActions();
    });
  }

  startTeamLongPress(team: Team) {
    this.beginLongPress(() => {
      this.musService.removePoint(team);
      this.syncHeaderActions();
    });
  }

  cancelLongPress() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  reset() {
    this.cancelLongPress();
    this.pendingCategoryPointer = null;
    this.longPressHandled = false;
    this.dragHandled = false;
    this.clearCategoryDragState();
    this.musService.reset();
    this.syncHeaderActions();
  }

  undo() {
    this.cancelLongPress();
    this.pendingCategoryPointer = null;
    this.longPressHandled = false;
    this.dragHandled = false;
    this.clearCategoryDragState();
    this.musService.undo();
    this.syncHeaderActions();
  }

  getFirstHalfScore(score: number): number {
    return Math.min(20, score);
  }

  getSecondHalfScore(score: number): number {
    return Math.max(0, score - 20);
  }

  getSticks(points: number): number[] {
    const p1 = Math.min(5, Math.max(0, points));
    const p2 = Math.min(5, Math.max(0, points - 5));
    const p3 = Math.min(5, Math.max(0, points - 10));
    const p4 = Math.min(5, Math.max(0, points - 15));
    return [p1, p2, p3, p4];
  }

  @HostListener('window:pointermove', ['$event'])
  onWindowPointerMove(event: PointerEvent) {
    if (this.activeDraggedCategory) {
      this.hoveredDropTeam.set(this.findTeamAtPoint(event.clientX, event.clientY));
      return;
    }

    if (!this.pendingCategoryPointer || event.pointerId !== this.pendingCategoryPointer.pointerId) {
      return;
    }

    const movedX = Math.abs(event.clientX - this.pendingCategoryPointer.x);
    const movedY = Math.abs(event.clientY - this.pendingCategoryPointer.y);
    const hasMovedEnough = movedX > DRAG_THRESHOLD_PX || movedY > DRAG_THRESHOLD_PX;

    if (!hasMovedEnough || this.categoryValue(this.pendingCategoryPointer.category) <= 0) {
      return;
    }

    this.cancelLongPress();
    this.activeDraggedCategory = this.pendingCategoryPointer.category;
    this.hoveredDropTeam.set(this.findTeamAtPoint(event.clientX, event.clientY));
  }

  @HostListener('window:pointerup', ['$event'])
  onWindowPointerUp(event: PointerEvent) {
    if (this.activeDraggedCategory) {
      const team = this.findTeamAtPoint(event.clientX, event.clientY);
      if (team !== null) {
        this.musService.awardCategory(this.activeDraggedCategory, team);
        this.syncHeaderActions();
      }

      this.dragHandled = true;
      this.clearCategoryDragState();
    }

    this.pendingCategoryPointer = null;
    this.cancelLongPress();
    this.releasePointerCapture(event);
  }

  @HostListener('window:pointercancel', ['$event'])
  onWindowPointerCancel(event: PointerEvent) {
    this.pendingCategoryPointer = null;
    this.cancelLongPress();
    this.dragHandled = false;
    this.clearCategoryDragState();
    this.releasePointerCapture(event);
  }

  private beginLongPress(action: () => void) {
    this.cancelLongPress();
    this.longPressHandled = false;
    this.longPressTimer = setTimeout(() => {
      action();
      this.longPressHandled = true;
      this.longPressTimer = null;
    }, LONG_PRESS_MS);
  }

  private consumeLongPress(): boolean {
    const handled = this.longPressHandled;
    this.longPressHandled = false;
    return handled;
  }

  private consumeDrag(): boolean {
    const handled = this.dragHandled;
    this.dragHandled = false;
    return handled;
  }

  private clearCategoryDragState() {
    this.activeDraggedCategory = null;
    this.hoveredDropTeam.set(null);
  }

  private findTeamAtPoint(x: number, y: number): Team | null {
    const element = document.elementFromPoint(x, y)?.closest('[data-team-zone]');
    const teamId = element?.getAttribute('data-team-id');

    if (teamId === '0' || teamId === '1') {
      return Number(teamId) as Team;
    }

    return null;
  }

  private releasePointerCapture(event: PointerEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }

  private confirmReset() {
    if (!window.confirm('¿Seguro que querés reiniciar la partida?')) {
      return;
    }

    this.reset();
  }

  private syncHeaderActions() {
    this.layoutService.setConfig({
      title: 'Mus',
      actions: this.musService.canUndo() ? ['undo', 'reset'] : ['reset']
    });
  }
}
