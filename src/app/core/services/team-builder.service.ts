import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TeamBuilderService {
    players = signal<string[]>([]);

    setPlayers(playerNames: string[]) {
        this.players.set(playerNames);
    }

    getPlayers(): string[] {
        return this.players();
    }
}
