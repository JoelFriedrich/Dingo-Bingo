"use client";

import type { BingoSquareState } from '@/types/bingo';
import BingoSquare from './BingoSquare';
import { BINGO_CARD_SIZE } from '@/types/bingo';

interface BingoCardProps {
  squares: BingoSquareState[];
  onSquareClick: (index: number) => void;
  winningPattern?: number[];
  disabled?: boolean;
}

export default function BingoCard({ squares, onSquareClick, winningPattern = [], disabled = false }: BingoCardProps) {
  if (!squares || squares.length === 0) {
    return <p className="text-center text-muted-foreground">Loading card...</p>;
  }
  
  return (
    <div 
      className="grid gap-2 sm:gap-3 md:gap-4 p-1"
      style={{ gridTemplateColumns: `repeat(${BINGO_CARD_SIZE}, minmax(0, 1fr))` }}
      role="grid"
      aria-label="Bingo Card"
    >
      {squares.map((square, index) => (
        <BingoSquare
          key={square.id}
          square={square}
          onClick={() => onSquareClick(index)}
          isWinningSquare={winningPattern.includes(index)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
