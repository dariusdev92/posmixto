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
  templateUrl: './mus.component.html'
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
        this.layoutService.resetActionTrigger();
        return;
      }

      if (action === 'reset') {
        this.confirmReset();
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
