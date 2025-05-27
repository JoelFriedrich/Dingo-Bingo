
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { BingoSquareState, GameMode } from '@/types/bingo';
import { BINGO_CARD_TOTAL_SQUARES, GAME_MODES } from '@/types/bingo';
import { generateBingoCard, checkWin, DEFAULT_PHRASES, PHRASES_STORAGE_KEY } from '@/lib/bingo-utils';
import BingoCard from '@/components/bingo/BingoCard';
import GameModeSelector from '@/components/bingo/GameModeSelector';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PartyPopper, RefreshCcw, Play, Trophy } from 'lucide-react'; // Changed Confetti to PartyPopper
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

export default function BingoPage() {
  const [phrases, setPhrases] = useState<string[]>(DEFAULT_PHRASES);
  const [currentCard, setCurrentCard] = useState<BingoSquareState[]>([]);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>('classic');
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winningPattern, setWinningPattern] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load phrases from localStorage on component mount (client-side only)
    const storedPhrases = localStorage.getItem(PHRASES_STORAGE_KEY);
    if (storedPhrases) {
      try {
        const parsedPhrases = JSON.parse(storedPhrases);
        if (Array.isArray(parsedPhrases) && parsedPhrases.length > 0) {
          setPhrases(parsedPhrases);
        }
      } catch (error) {
        console.error("Failed to parse phrases from localStorage", error);
      }
    }
  }, []);

  const startNewGame = useCallback(() => {
    const newCard = generateBingoCard(phrases, selectedGameMode);
    setCurrentCard(newCard);
    setGameStarted(true);
    setGameOver(false);
    setWinningPattern([]);
  }, [phrases, selectedGameMode]);

  useEffect(() => {
    // Auto-start game if phrases are loaded and a mode is selected, but not if already started
    // This might be too aggressive, let's rely on the button.
    // if (phrases.length > 0 && selectedGameMode && !gameStarted && !gameOver) {
    //   startNewGame();
    // }
    // Instead, if the game is not started, show a placeholder or setup prompt
  }, [phrases, selectedGameMode, gameStarted, gameOver, startNewGame]);


  const handleSquareClick = (index: number) => {
    if (gameOver || !gameStarted) return;

    const newCard = [...currentCard];
    const square = newCard[index];

    if (square.isFreeSpace) return;

    newCard[index] = { ...square, selected: !square.selected };
    setCurrentCard(newCard);

    const winCheck = checkWin(newCard, selectedGameMode);
    if (winCheck.isWin) {
      setGameOver(true);
      setWinningPattern(winCheck.winningPattern);
      const gameModeDetails = GAME_MODES.find(gm => gm.id === selectedGameMode);
      toast({
        title: "BINGO!",
        description: `You won with ${gameModeDetails?.name || 'the selected mode'}!`,
        action: <PartyPopper className="text-yellow-400" />, // Changed Confetti to PartyPopper
        duration: 5000,
      });
    }
  };

  const handleModeChange = (mode: GameMode) => {
    setSelectedGameMode(mode);
    // Reset game if mode changes after starting
    if (gameStarted) {
      setGameStarted(false); // This will allow re-triggering startNewGame via button
      setGameOver(false);
      setCurrentCard([]); // Clear card to show loading/prompt
      setWinningPattern([]);
    }
  };

  const sufficientPhrases = phrases.length >= BINGO_CARD_TOTAL_SQUARES - (selectedGameMode === 'classic' ? 1:0);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <GameModeSelector selectedMode={selectedGameMode} onModeChange={handleModeChange} disabled={gameStarted && !gameOver} />

      {!sufficientPhrases && (
         <Alert variant="destructive" className="max-w-lg">
          <Trophy className="h-4 w-4" /> {/* Using Trophy as a placeholder for an alert icon */}
          <AlertTitle>Not Enough Phrases!</AlertTitle>
          <AlertDescription>
            You need at least {BINGO_CARD_TOTAL_SQUARES - (selectedGameMode === 'classic' ? 1:0)} unique phrases for the current game mode. Please 
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/setup"> add more phrases</Link>
            </Button> or use the defaults.
          </AlertDescription>
        </Alert>
      )}

      {gameStarted ? (
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl bg-card p-4 sm:p-6 rounded-lg shadow-xl">
          <BingoCard
            squares={currentCard}
            onSquareClick={handleSquareClick}
            winningPattern={winningPattern}
            disabled={gameOver}
          />
        </div>
      ) : (
        <div className="text-center p-8 bg-card rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Ready to Play?</h2>
          <p className="text-muted-foreground mb-6">
            Select your game mode above and hit "Start Game" to begin the fun!
            { !sufficientPhrases && " You might want to set up your phrases first."}
          </p>
        </div>
      )}
      
      <div className="flex gap-4 items-center">
        <Button 
          onClick={startNewGame} 
          size="lg" 
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={!sufficientPhrases && !gameStarted} // Disable if not enough phrases unless game already started (then it's a reset)
        >
          {gameStarted ? <RefreshCcw className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {gameStarted ? (gameOver ? 'New Game' : 'Restart Game') : 'Start Game'}
        </Button>
      </div>

      {gameOver && (
        <div className="mt-4 p-6 bg-green-100 border-2 border-green-500 rounded-lg shadow-lg text-center max-w-md">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-green-700">Congratulations! You got BINGO!</h3>
          <p className="text-green-600 mt-2">Click "New Game" to play again with the same mode and phrases, or choose a new mode.</p>
        </div>
      )}
    </div>
  );
}

