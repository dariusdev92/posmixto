import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PlayerInputComponent } from '../player-input/player-input.component';
import { ScoreGridComponent } from '../score-grid/score-grid.component';
import { GeneralaStateService } from '../../services/generala-state.service';
import { Player } from '../../models/player.types';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
    selector: 'app-generala',
    imports: [CommonModule, RouterModule, PlayerInputComponent, ScoreGridComponent, HlmButton],
    templateUrl: './generala.component.html'
})
export class GeneralaComponent implements OnInit {
    stateService = inject(GeneralaStateService);
    isGameActive = this.stateService.isGameActive;
    private route = inject(ActivatedRoute);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['action'] === 'reset') {
                this.resetGame();
            }
        });
    }

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
