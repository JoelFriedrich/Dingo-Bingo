"use client";

import type { BingoSquareState } from '@/types/bingo';
import { cn } from '@/lib/utils';

interface BingoSquareProps {
  square: BingoSquareState;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled?: boolean;
}

export default function BingoSquare({ square, onClick, isWinningSquare, disabled = false }: BingoSquareProps) {
  const { text, selected, isFreeSpace } = square;

  const handleClick = () => {
    if (!isFreeSpace && !disabled) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "bingo-square-container rounded-md shadow-md",
        (selected || isFreeSpace) && "is-flipped",
        isWinningSquare && !isFreeSpace && "bingo-square-winning",
        (isFreeSpace || disabled) ? "cursor-default" : "cursor-pointer"
      )}
      onClick={handleClick}
      aria-pressed={selected}
      role="button"
      tabIndex={isFreeSpace || disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="bingo-square-flipper">
        <div className="bingo-square-face bingo-square-front">
          {text}
        </div>
        <div className="bingo-square-face bingo-square-back">
          {text}
        </div>
      </div>
    </div>
  );
}
