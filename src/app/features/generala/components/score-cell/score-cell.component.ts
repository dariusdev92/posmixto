import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerScores, ScoreCategory, ScoreEntry } from '../../models/generala.models';
import { GeneralaScoringService } from '../../services/generala-scoring.service';
import { GeneralaStateService } from '../../services/generala-state.service';
import { ScoreDialogComponent, ScoreDialogData, ScoreDialogResult } from '../score-dialog/score-dialog.component';
import { CATEGORY_LABELS } from '../../models/generala.models';
import { HlmDialogService } from '@spartan-ng/helm/dialog';

@Component({
    selector: 'app-score-cell',
    imports: [CommonModule],
    templateUrl: './score-cell.component.html'
})
export class ScoreCellComponent {
    private scoringService = inject(GeneralaScoringService);
    private stateService = inject(GeneralaStateService);
    private dialogService = inject(HlmDialogService);

    playerId = input.required<string>();
    category = input.required<ScoreCategory>();
    scores = input.required<PlayerScores>();

    // The entry for this specific cell
    entry = computed(() => this.scores()[this.category()]);

    // Whether the game is finished (prevent edits)
    isFinished = computed(() => this.stateService.gameState()?.isFinished ?? false);

    // UI State for the popup
    options = computed(() => this.scoringService.getValidOptionsForCategory(this.category()));

    async toggleSelection() {
        if (this.isFinished()) {
            return; // Game over
        }

        const dialogRef = this.dialogService.open(
            ScoreDialogComponent,
            {
                context: {
                    title: `Anotar al ${CATEGORY_LABELS[this.category()]}`,
                    hasValue: !!this.entry(),
                    options: this.options()
                },
                contentClass: 'w-[300px]'
            }
        );

        dialogRef.closed$.subscribe((result: ScoreDialogResult) => {
            if (!result) return;
            if (result.action === 'select') {
                this.stateService.setScore(this.playerId(), this.category(), {
                    points: result.option.points,
                    type: result.option.type
                });
            } else if (result.action === 'clear') {
                this.stateService.setScore(this.playerId(), this.category(), null);
            }
        });
    }
}
