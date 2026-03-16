export type ScoreCategory =
    | '1' | '2' | '3' | '4' | '5' | '6'
    | 'ESCALERA' | 'FULL' | 'POKER' | 'GENERALA' | 'GENERALA_DOBLE';

export type PlayType = 'SERVIDO' | 'ARMADO' | 'TACHA' | 'NORMAL';

export interface ScoreEntry {
    points: number;
    type: PlayType;
}

export type PlayerScores = {
    [key in ScoreCategory]?: ScoreEntry;
};

export interface GeneralaGameState {
    id: string;
    createdAt: number;
    players: string[]; // array of player ids
    scores: Record<string, PlayerScores>; // playerId -> PlayerScores
    isFinished: boolean;
}

export const CATEGORY_LABELS: Record<ScoreCategory, string> = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    'ESCALERA': 'E',
    'FULL': 'F',
    'POKER': 'P',
    'GENERALA': 'G',
    'GENERALA_DOBLE': 'GG',
};
