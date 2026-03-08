import { Injectable, computed, inject, signal } from '@angular/core';
import { GeneralaGameState, PlayerScores, ScoreCategory, ScoreEntry } from '../models/generala.models';
import { nanoid } from 'nanoid';
import { GeneralaScoringService } from './generala-scoring.service';
import { GameSessionService } from '../../../common/services/game-session.service';
import { Player } from '../../../common/models/player.model';

const STORAGE_KEY = 'PWA_GENERALA_STATE';

@Injectable({
    providedIn: 'root'
})
export class GeneralaStateService {
    private sessionService = inject(GameSessionService);
    private scoringService = inject(GeneralaScoringService);

    // Private reactive state
    private state = signal<GeneralaGameState | null>(null);
    private playersRef = signal<Player[]>([]); // We hold the actual player objects for display

    // Public computed state
    gameState = this.state.asReadonly();
    activePlayers = this.playersRef.asReadonly();

    isGameActive = computed(() => this.state() !== null);

    constructor() {
        this.loadSavedGame();
    }

    private loadSavedGame() {
        const saved = this.sessionService.loadGame<{ state: GeneralaGameState, players: Player[] }>(STORAGE_KEY);
        if (saved) {
            this.state.set(saved.state);
            this.playersRef.set(saved.players);
        }
    }

    private persist() {
        const currentState = this.state();
        const currentPlayers = this.playersRef();
        if (currentState) {
            this.sessionService.saveGame(STORAGE_KEY, { state: currentState, players: currentPlayers });
        } else {
            this.sessionService.clearGame(STORAGE_KEY);
        }
    }

    startGame(players: Player[]) {
        const scores: Record<string, PlayerScores> = {};
        players.forEach(p => scores[p.id] = {});

        const newState: GeneralaGameState = {
            id: nanoid(),
            createdAt: Date.now(),
            players: players.map(p => p.id),
            scores,
            isFinished: false
        };

        this.playersRef.set(players);
        this.state.set(newState);
        this.persist();
    }

    endGame() {
        this.state.update(s => s ? { ...s, isFinished: true } : s);
        this.persist();
    }

    resetGame() {
        this.state.set(null);
        this.playersRef.set([]);
        this.persist();
    }

    setScore(playerId: string, category: ScoreCategory, entry: ScoreEntry | null) {
        this.state.update(current => {
            if (!current) return current;

            const newScores = { ...current.scores };

            if (entry === null) {
                const playerCategoris = { ...newScores[playerId] };
                delete playerCategoris[category];
                newScores[playerId] = playerCategoris;
            } else {
                newScores[playerId] = {
                    ...newScores[playerId],
                    [category]: entry
                };
            }

            return { ...current, scores: newScores };
        });
        this.persist();
    }
}
