import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GameSessionService {
    constructor() { }

    saveGame<T>(key: string, gameData: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(gameData));
        } catch (e) {
            console.warn('Could not save game to local storage', e);
        }
    }

    loadGame<T>(key: string): T | null {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) as T : null;
        } catch (e) {
            console.warn('Could not load game from local storage', e);
            return null;
        }
    }

    clearGame(key: string): void {
        localStorage.removeItem(key);
    }
}
