
export interface BingoSquareState {
  id: string;
  text: string;
  selected: boolean;
  isFreeSpace?: boolean;
}

export type GameMode = 'classic' | 'blackout' | 'corners' | 'rowsAndColumns';

export interface GameModeDetails {
  id: GameMode;
  name: string;
  description: string;
}

export const GAME_MODES: GameModeDetails[] = [
  { id: 'classic', name: 'Classic', description: 'Five in a row (horizontal, vertical, or diagonal). Center square is FREE!' },
  { id: 'blackout', name: 'Blackout', description: 'Mark all squares on the card.' },
  { id: 'corners', name: 'Corners', description: 'Mark all four corner squares.' },
  { id: 'rowsAndColumns', name: 'Rows & Columns', description: 'Mark any full row AND any full column.' },
];

export const BINGO_CARD_SIZE = 5; // 5x5 grid
export const BINGO_CARD_TOTAL_SQUARES = BINGO_CARD_SIZE * BINGO_CARD_SIZE;

export const GAME_MODE_STORAGE_KEY = 'bingoGameMode';
export const PLAYER_NAME_STORAGE_KEY = 'bingoPlayerName';
