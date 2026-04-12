import { Component, HostListener, Input, inject } from '@angular/core';
import { TrucoService } from './truco.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideRotateCcw } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';

// Inline component for the sticks
@Component({
  selector: 'app-palitos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-16 h-16 transition-all duration-100">
      <!-- 
        Palitos arrangement:
        1: vertical left
        2: vertical right
        3: horizontal top
        4: horizontal bottom
        5: diagonal
      -->
      <!-- Stick 1 -->
      <div class="absolute left-0 top-0 w-2 h-full rounded-full transition-colors duration-200" [ngClass]="count >= 1 ? 'bg-zinc-300' : 'bg-transparent'"></div>
      <!-- Stick 2 -->
      <div class="absolute left-0 top-0 w-full h-2 rounded-full transition-colors duration-200" [ngClass]="count >= 2 ? 'bg-zinc-300' : 'bg-transparent'"></div>
      <!-- Stick 3 -->
      <div class="absolute right-0 top-0 w-2 h-full rounded-full transition-colors duration-200" [ngClass]="count >= 3 ? 'bg-zinc-300' : 'bg-transparent'"></div>
      <!-- Stick 4 -->
      <div class="absolute left-0 bottom-0 w-full h-2 rounded-full transition-colors duration-200" [ngClass]="count >= 4 ? 'bg-zinc-300' : 'bg-transparent'"></div>
      <!-- Stick 5 (Diagonal) -->
      <div class="absolute left-1/2 top-1/2 w-[140%] h-2 rounded-full origin-center -translate-x-1/2 -translate-y-1/2 rotate-45 transition-colors duration-200" [ngClass]="count >= 5 ? 'bg-zinc-300' : 'bg-transparent'"></div>
    </div>
  `
})
export class PalitosComponent {
  // Can be 1, 2, 3, 4, 5
  @Input() count!: number;
}

@Component({
  selector: 'app-truco',
  standalone: true,
  imports: [CommonModule, PalitosComponent, RouterLink, NgIconComponent, HlmButton],
  providers: [provideIcons({ lucideArrowLeft, lucideRotateCcw })],
  template: `
    <div class="flex flex-col h-dvh bg-background text-foreground">
      <header class="flex items-center p-4 border-b bg-card">
          <button hlmBtn variant="ghost" size="icon" routerLink="/" aria-label="Volver a Inicio">
              <ng-icon name="lucideArrowLeft"></ng-icon>
          </button>
          <h1 class="text-xl font-semibold tracking-tight ml-4 flex-1">Anotador de Truco</h1>
          <button hlmBtn variant="ghost" size="icon" (click)="reset()" aria-label="Limpiar Partida"
              class="text-muted-foreground hover:text-foreground">
              <ng-icon name="lucideRotateCcw"></ng-icon>
          </button>
      </header>
  
      <main class="flex-1 overflow-hidden relative touch-none select-none bg-zinc-900 text-zinc-100 grid grid-cols-[1fr_4px_1fr] pb-4 rounded-b-xl border border-t-0 border-border mx-auto w-full">
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
          <div class="grid grid-cols-1 content-start place-items-center gap-4">
            @for (stick of getSticks(scores[1] > 15 ? 15 : scores[1]); track $index) {
              <app-palitos [count]="stick"></app-palitos>
            }
          </div>
          
          <!-- Midline Divider -->
          <div class="w-full h-1 bg-zinc-700 my-4 opacity-50"></div>
  
          <!-- Buenas -->
          <div class="grid grid-cols-1 content-start place-items-center gap-4">
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
  Math = Math;

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
