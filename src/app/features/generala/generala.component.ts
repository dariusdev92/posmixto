import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayerInputComponent } from '../../common/components/player-input/player-input.component';
import { ScoreGridComponent } from './components/score-grid/score-grid.component';
import { GeneralaStateService } from './services/generala-state.service';
import { Player } from '../../common/models/player.model';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideRotateCcw } from '@ng-icons/lucide';

@Component({
    selector: 'app-generala',
    imports: [CommonModule, RouterModule, PlayerInputComponent, ScoreGridComponent, HlmButton, NgIcon],
    providers: [provideIcons({ lucideArrowLeft, lucideRotateCcw })],
    templateUrl: './generala.component.html'
})
export class GeneralaComponent {
    stateService = inject(GeneralaStateService);
    isGameActive = this.stateService.isGameActive;

    setupPlayers: Player[] = [];
    players = this.stateService.activePlayers; // In case we want to show it before starting

    startGame(playersList: Player[]) {
        if (playersList.length > 0) {
            this.stateService.startGame(playersList);
        }
    }

    endGame() {
        if (confirm('¿Estás seguro de que quieres terminar la partida?')) {
            this.stateService.endGame();
        }
    }

    resetGame() {
        if (confirm('¿Estás seguro de reiniciar? Se perderán todos los datos actuales.')) {
            this.stateService.resetGame();
        }
    }
}
