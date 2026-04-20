import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralaStateService } from '../../services/generala-state';
import { ScoreCellComponent } from '../score-cell/score-cell';
import { GeneralaScoringService } from '../../services/generala-scoring';
import { CATEGORY_LABELS, ScoreCategory } from '../../models/generala.models';

@Component({
    selector: 'app-score-grid',
    standalone: true,
    imports: [CommonModule, ScoreCellComponent],
    templateUrl: './score-grid.component.html'
})
export class ScoreGridComponent {
    private stateService = inject(GeneralaStateService);
    private scoringService = inject(GeneralaScoringService);

    players = this.stateService.activePlayers;
    gameState = this.stateService.gameState;

    // Ordered categories to display
    categories: ScoreCategory[] = [
        '1', '2', '3', '4', '5', '6',
        'ESCALERA', 'FULL', 'POKER', 'GENERALA', 'GENERALA_DOBLE'
    ];

    // Helpers
    getLabel(cat: ScoreCategory): string {
        return CATEGORY_LABELS[cat];
    }

    getPlayerTotal(playerId: string): number {
        const state = this.gameState();
        if (!state || !state.scores[playerId]) return 0;
        return this.scoringService.calculateTotal(state.scores[playerId]);
    }
}
