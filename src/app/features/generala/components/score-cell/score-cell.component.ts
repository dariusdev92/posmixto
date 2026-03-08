import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerScores, ScoreCategory, ScoreEntry } from '../../models/generala.models';
import { GeneralaScoringService } from '../../services/generala-scoring.service';
import { GeneralaStateService } from '../../services/generala-state.service';

@Component({
    selector: 'app-score-cell',
    imports: [CommonModule],
    templateUrl: './score-cell.component.html',
    styleUrl: './score-cell.component.scss'
})
export class ScoreCellComponent {
    private scoringService = inject(GeneralaScoringService);
    private stateService = inject(GeneralaStateService);

    playerId = input.required<string>();
    category = input.required<ScoreCategory>();
    scores = input.required<PlayerScores>();

    // The entry for this specific cell
    entry = computed(() => this.scores()[this.category()]);

    // Whether the game is finished (prevent edits)
    isFinished = computed(() => this.stateService.gameState()?.isFinished ?? false);

    // UI State for the popup
    isSelecting = false;
    options = computed(() => this.scoringService.getValidOptionsForCategory(this.category()));

    toggleSelection() {
        if (this.isFinished()) {
            return; // Game over
        }
        this.isSelecting = !this.isSelecting;
    }

    selectOption(option: { points: number, type: any }) {
        this.stateService.setScore(this.playerId(), this.category(), {
            points: option.points,
            type: option.type
        });
        this.isSelecting = false;
    }

    closeSelection() {
        this.isSelecting = false;
    }

    clearScore() {
        this.stateService.setScore(this.playerId(), this.category(), null);
        this.isSelecting = false;
    }
}
