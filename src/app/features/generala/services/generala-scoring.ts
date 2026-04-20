import { Injectable } from '@angular/core';
import { PlayType, ScoreCategory, ScoreEntry, PlayerScores } from '../models/generala.models';

@Injectable({
    providedIn: 'root'
})
export class GeneralaScoringService {

    // Maximum valid points per category
    private categoryPoints: Record<ScoreCategory, number | null> = {
        '1': null, // Varies
        '2': null,
        '3': null,
        '4': null,
        '5': null,
        '6': null,
        'ESCALERA': 20, // 20 armado, 25 servido
        'FULL': 30,     // 30 armado, 35 servido
        'POKER': 40,    // 40 armado, 45 servido
        'GENERALA': 50, // 50
        'GENERALA_DOBLE': 100 // 100
    };

    /**
     * Calculates the subtotal (categories 1 to 6)
     */
    calculateSubtotal(scores: PlayerScores): number {
        let sum = 0;
        const numberCategories: ScoreCategory[] = ['1', '2', '3', '4', '5', '6'];

        for (const cat of numberCategories) {
            if (scores[cat]) {
                sum += scores[cat]!.points;
            }
        }
        return sum;
    }

    /**
     * Calculates the subtotal bonus (if subtotal >= 60, bonus is usually 0, but sometimes rules give extra points.
     * Standard rules: No extra points, just a reference. Some variations give +35 or so. We'll leave it simple for now).
     */
    hasSubtotalBonus(subtotal: number): boolean {
        return subtotal >= 63;
    }

    /**
     * Calculates the total score including all categories
     */
    calculateTotal(scores: PlayerScores): number {
        let total = 0;
        for (const key in scores) {
            const entry = scores[key as ScoreCategory];
            if (entry) {
                total += entry.points;
            }
        }
        return total;
    }

    /**
     * Helper to determine valid points for a specific category when the user clicks it.
     * E.g. Escalera -> [20, 25, 0]
     */
    getValidOptionsForCategory(category: ScoreCategory): { points: number, type: PlayType, label: string }[] {
        switch (category) {
            case '1': return this.generateOptionsMultipleOf(1);
            case '2': return this.generateOptionsMultipleOf(2);
            case '3': return this.generateOptionsMultipleOf(3);
            case '4': return this.generateOptionsMultipleOf(4);
            case '5': return this.generateOptionsMultipleOf(5);
            case '6': return this.generateOptionsMultipleOf(6);
            case 'ESCALERA':
                return [
                    { points: 20, type: 'ARMADO', label: '20' },
                    { points: 25, type: 'SERVIDO', label: '25' },
                    { points: 0, type: 'TACHA', label: 'Tachar' }
                ];
            case 'FULL':
                return [
                    { points: 30, type: 'ARMADO', label: '30' },
                    { points: 35, type: 'SERVIDO', label: '35' },
                    { points: 0, type: 'TACHA', label: 'Tachar' }
                ];
            case 'POKER':
                return [
                    { points: 40, type: 'ARMADO', label: '40' },
                    { points: 45, type: 'SERVIDO', label: '45' },
                    { points: 0, type: 'TACHA', label: 'Tachar' }
                ];
            case 'GENERALA':
                return [
                    // { points: 50, type: 'SERVIDO', label: '50' }, // Usually Generala servida finishes the game, but we keep it simple
                    { points: 50, type: 'ARMADO', label: '50' },
                    { points: 0, type: 'TACHA', label: 'Tachar' }
                ];
            case 'GENERALA_DOBLE':
                return [
                    { points: 100, type: 'ARMADO', label: '100' },
                    { points: 0, type: 'TACHA', label: 'Tachar' }
                ];
        }
    }

    private generateOptionsMultipleOf(num: number): { points: number, type: PlayType, label: string }[] {
        const options: { points: number, type: PlayType, label: string }[] = [];
        for (let i = 1; i <= 5; i++) {
            options.push({ points: num * i, type: 'NORMAL', label: `${num * i}` });
        }
        options.push({ points: 0, type: 'TACHA', label: 'Tachar' });
        return options; // Highest first usually better UX
    }
}
