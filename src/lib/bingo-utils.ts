import type { BingoSquareState, GameMode } from '@/types/bingo';
import { BINGO_CARD_SIZE, BINGO_CARD_TOTAL_SQUARES } from '@/types/bingo';

export const PHRASES_STORAGE_KEY = 'bingoBonanzaPhrases';

export const DEFAULT_PHRASES: string[] = [
  "Sunshine", "Moonlight", "Starry Night", "Ocean Breeze", "Mountain Peak",
  "Forest Trail", "Desert Sands", "City Lights", "Cozy Fireplace", "Morning Dew",
  "Rainbow Colors", "Flower Garden", "Singing Birds", "Laughing Child", "Good Book",
  "Hot Coffee", "Ice Cream", "Pizza Party", "Movie Night", "Road Trip",
  "Happy Dance", "Quiet Moment", "Helping Hand", "Fresh Start", "Dream Big",
  "Bonus Word", "Extra Point", "You Got This", "Keep Going", "Almost There"
];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateBingoCard(phrases: string[], gameMode: GameMode): BingoSquareState[] {
  if (phrases.length < BINGO_CARD_TOTAL_SQUARES - (gameMode === 'classic' ? 1:0) ) { // Need one less if classic due to free space
    console.warn("Not enough phrases to fill the card, using defaults where necessary.");
    const needed = BINGO_CARD_TOTAL_SQUARES - (gameMode === 'classic' ? 1:0) - phrases.length;
    phrases = [...phrases, ...shuffleArray(DEFAULT_PHRASES).slice(0, needed)];
  }

  const shuffledPhrases = shuffleArray(phrases);
  const cardSquares: BingoSquareState[] = [];

  for (let i = 0; i < BINGO_CARD_TOTAL_SQUARES; i++) {
    const isCenterSquare = i === Math.floor(BINGO_CARD_TOTAL_SQUARES / 2);
    if (gameMode === 'classic' && isCenterSquare) {
      cardSquares.push({
        id: `square-${i}`,
        text: 'FREE',
        selected: true,
        isFreeSpace: true,
      });
    } else {
      cardSquares.push({
        id: `square-${i}`,
        text: shuffledPhrases.pop() || `Phrase ${i+1}`, // Fallback text
        selected: false,
      });
    }
  }
  return cardSquares;
}

function getRow(card: BingoSquareState[], rowIndex: number): BingoSquareState[] {
  return card.slice(rowIndex * BINGO_CARD_SIZE, (rowIndex + 1) * BINGO_CARD_SIZE);
}

function getColumn(card: BingoSquareState[], colIndex: number): BingoSquareState[] {
  const column: BingoSquareState[] = [];
  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    column.push(card[i * BINGO_CARD_SIZE + colIndex]);
  }
  return column;
}

function getDiagonals(card: BingoSquareState[]): [BingoSquareState[], BingoSquareState[]] {
  const diag1: BingoSquareState[] = [];
  const diag2: BingoSquareState[] = [];
  for (let i = 0; i < BINGO_CARD_SIZE; i++) {
    diag1.push(card[i * BINGO_CARD_SIZE + i]);
    diag2.push(card[i * BINGO_CARD_SIZE + (BINGO_CARD_SIZE - 1 - i)]);
  }
  return [diag1, diag2];
}

function allSelected(squares: BingoSquareState[]): boolean {
  return squares.every(sq => sq.selected);
}

export function checkWin(
  card: BingoSquareState[],
  gameMode: GameMode
): { isWin: boolean; winningPattern: number[] } {
  const winningPattern: number[] = [];

  const addPattern = (squares: BingoSquareState[]) => {
    squares.forEach(sq => {
      const index = card.findIndex(s => s.id === sq.id);
      if (index !== -1 && !winningPattern.includes(index)) {
        winningPattern.push(index);
      }
    });
  };
  
  let isWin = false;

  if (gameMode === 'classic') {
    // Check rows
    for (let i = 0; i < BINGO_CARD_SIZE; i++) {
      const row = getRow(card, i);
      if (allSelected(row)) {
        addPattern(row);
        isWin = true;
      }
    }
    // Check columns
    for (let i = 0; i < BINGO_CARD_SIZE; i++) {
      const col = getColumn(card, i);
      if (allSelected(col)) {
        addPattern(col);
        isWin = true;
      }
    }
    // Check diagonals
    const [diag1, diag2] = getDiagonals(card);
    if (allSelected(diag1)) {
      addPattern(diag1);
      isWin = true;
    }
    if (allSelected(diag2)) {
      addPattern(diag2);
      isWin = true;
    }
  } else if (gameMode === 'blackout') {
    if (allSelected(card)) {
      addPattern(card);
      isWin = true;
    }
  } else if (gameMode === 'corners') {
    const corners = [
      card[0],
      card[BINGO_CARD_SIZE - 1],
      card[BINGO_CARD_TOTAL_SQUARES - BINGO_CARD_SIZE],
      card[BINGO_CARD_TOTAL_SQUARES - 1],
    ];
    if (allSelected(corners)) {
      addPattern(corners);
      isWin = true;
    }
  } else if (gameMode === 'rowsAndColumns') {
    let rowWin = false;
    let colWin = false;
    let tempRowPattern: BingoSquareState[] = [];
    let tempColPattern: BingoSquareState[] = [];

    for (let i = 0; i < BINGO_CARD_SIZE; i++) {
      const row = getRow(card, i);
      if (allSelected(row)) {
        rowWin = true;
        tempRowPattern = row; // Take the first winning row
        break;
      }
    }
    for (let i = 0; i < BINGO_CARD_SIZE; i++) {
      const col = getColumn(card, i);
      if (allSelected(col)) {
        colWin = true;
        tempColPattern = col; // Take the first winning column
        break;
      }
    }
    if (rowWin && colWin) {
      addPattern(tempRowPattern);
      addPattern(tempColPattern);
      isWin = true;
    }
  }
  
  // Ensure winning pattern only contains unique indices
  const uniqueWinningPattern = Array.from(new Set(winningPattern));
  return { isWin, winningPattern: isWin ? uniqueWinningPattern : [] };
}
