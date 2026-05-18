import { CommonModule } from '@angular/common';
import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { PalitosComponent } from '../../../../core/components/palitos/palitos.component';
import { actionClickTrigger, LayoutService } from '../../../../layout/layout.service';
import { MusService } from '../../services/mus.service';
import { DRAG_THRESHOLD_PX, LONG_PRESS_MS, MUS_MAX_SCORE } from '../../models/mus.domain';
import { MusCategoryDefinition, MusCategoryKey, PendingCategoryPointer, Team } from '../../models/mus.types';

@Component({
  selector: 'app-mus',
  standalone: true,
  imports: [CommonModule, PalitosComponent],
  template: `
    @if (dragPreview()) {
      <div 
        class="fixed pointer-events-none bg-white text-black z-50 select-none px-4 rounded-lg shadow-xl text-lg font-bold transition-transform"
        [style.left.px]="dragPreview()!.x"
        [style.top.px]="dragPreview()!.y"
        [style.transform]="'translate(-50%, calc(-100% - .5rem))'"
      >
        <div>{{ getCategoryLabel(dragPreview()!.category) }} ({{ categoryValue(dragPreview()!.category) }})</div>
      </div>
    }

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
  readonly dragPreview = signal<{ category: MusCategoryKey; x: number; y: number } | null>(null);

  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private longPressHandled = false;
  private dragHandled = false;
  private activeDraggedCategory: MusCategoryKey | null = null;
  private pendingCategoryPointer: PendingCategoryPointer | null = null;

  constructor() {
    this.syncHeaderActions();

    effect(() => {
      const action = actionClickTrigger();
      if (!action) {
        return;
      }

      if (action === 'undo') {
        this.undo();
        return;
      }

      if (action === 'reset') {
        this.confirmReset();
        // Reset trigger after handling
        this.layoutService.resetActionTrigger();
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

  getCategoryLabel(category: MusCategoryKey): string {
    const labels: Record<MusCategoryKey, string> = {
      grande: 'GRANDE',
      chica: 'CHICA',
      pares: 'PARES',
      juego: 'JUEGO',
      puntos: 'PUNTOS'
    };
    return labels[category];
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
      this.dragPreview.set({
        category: this.activeDraggedCategory,
        x: event.clientX,
        y: event.clientY
      });
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
    this.dragPreview.set({
      category: this.pendingCategoryPointer.category,
      x: event.clientX,
      y: event.clientY
    });
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
    this.dragPreview.set(null);
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
