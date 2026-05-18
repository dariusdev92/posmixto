import type { MusState } from './mus.types';

export const MUS_STORAGE_KEY = 'PWA_MUS_STATE';
export const MUS_MAX_SCORE = 40;
export const LONG_PRESS_MS = 450;
export const DRAG_THRESHOLD_PX = 8;

export const DEFAULT_MUS_STATE: MusState = {
  scores: [0, 0],
  categoryValues: {
    grande: 0,
    chica: 0,
    pares: 0,
    juego: 0,
    puntos: 0
  }
};