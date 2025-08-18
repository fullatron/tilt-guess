export type DeckId = 'animals' | 'actions';

export interface Settings {
  durationSec: number; // 45-180 in 15s steps
  deck: DeckId;
}

export interface RoundResult {
  correct: string[];
  passed: string[];
  durationSec: number;
  deck: DeckId;
}

export interface TiltEvent {
  direction: 'up' | 'down' | 'neutral';
  beta: number; // front-back tilt
  gamma: number; // left-right tilt
}
