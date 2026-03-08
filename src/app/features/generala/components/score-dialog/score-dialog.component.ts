import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface ScoreDialogData {
    title: string;
    hasValue: boolean;
    options: { points: number, type: any, label: string }[];
}

export type ScoreDialogResult = { action: 'select', option: any } | { action: 'clear' } | null;

@Component({
    selector: 'app-score-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content class="score-dialog-content">
      <div class="options-grid">
        @for (opt of data.options; track opt.label) {
          <button mat-raised-button 
                  [color]="opt.type === 'TACHA' ? 'warn' : 'primary'"
                  class="score-option-btn"
                  (click)="selectOption(opt)">
            {{ opt.label }}
          </button>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      @if (data.hasValue) {
        <button mat-button color="warn" (click)="clearScore()">Borrar Anotación</button>
      }
      <button mat-button mat-dialog-close>Cancelar</button>
    </mat-dialog-actions>
  `
})
export class ScoreDialogComponent {
    dialogRef = inject(MatDialogRef<ScoreDialogComponent>);
    data = inject<ScoreDialogData>(MAT_DIALOG_DATA);

    selectOption(option: any) {
        this.dialogRef.close({ action: 'select', option });
    }

    clearScore() {
        this.dialogRef.close({ action: 'clear' });
    }
}
