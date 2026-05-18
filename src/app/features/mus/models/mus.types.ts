export type Team = 0 | 1;

export type MusCategoryKey = 'grande' | 'chica' | 'pares' | 'juego' | 'puntos';

export interface MusState {
  scores: [number, number];
  categoryValues: Record<MusCategoryKey, number>;
}

export interface MusCategoryDefinition {
  key: MusCategoryKey;
  shortLabel: string;
}

export interface PendingCategoryPointer {
  category: MusCategoryKey;
  pointerId: number;
  x: number;
  y: number;
}

export type MusHistoryEntry = MusState;