import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { injectBrnDialogCtx } from '@spartan-ng/brain/dialog';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';

export interface ScoreDialogData {
  title: string;
  hasValue: boolean;
  options: { points: number, type: any, label: string }[];
}

export type ScoreDialogResult = { action: 'select', option: any } | { action: 'clear' } | null;

@Component({
  selector: 'app-score-dialog',
  standalone: true,
  imports: [CommonModule, HlmDialogImports, HlmButton],
  template: `
    <hlm-dialog-header>
      <h3 hlmDialogTitle>{{ context.title }}</h3>
      <!-- <p hlmDialogDescription></p> -->
    </hlm-dialog-header>
    
    <div class="grid grid-cols-2 gap-2 py-4">
      @for (opt of context.options; track opt.label) {
        <button hlmBtn 
                [variant]="opt.type === 'TACHA' ? 'destructive' : 'secondary'"
                (click)="selectOption(opt)">
          {{ opt.label }}
        </button>
      }
    </div>
    
    <div class="flex justify-end gap-2 pt-4">
      @if (context.hasValue) {
        <button hlmBtn variant="destructive" (click)="clearScore()">Borrar Anotación</button>
      }
    </div>
  `
})
export class ScoreDialogComponent {
  context = injectBrnDialogCtx<ScoreDialogData>();
  private dialogRef = inject(BrnDialogRef);

  selectOption(option: any) {
    this.dialogRef.close({ action: 'select', option });
  }

  clearScore() {
    this.dialogRef.close({ action: 'clear' });
  }

  closeDialog() {
    this.dialogRef.close(null);
  }
}
