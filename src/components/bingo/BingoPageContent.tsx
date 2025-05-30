
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { BingoSquareState, GameMode } from '@/types/bingo';
import { BINGO_CARD_TOTAL_SQUARES, GAME_MODES, GAME_MODE_STORAGE_KEY } from '@/types/bingo';
import { generateBingoCard, checkWin, DEFAULT_PHRASES, PHRASES_STORAGE_KEY } from '@/lib/bingo-utils';
import BingoCard from '@/components/bingo/BingoCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PartyPopper, RefreshCcw, Play, Trophy, Settings2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';

export default function BingoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This is now inside a component rendered under Suspense
  const [phrases, setPhrases] = useState<string[]>(DEFAULT_PHRASES);
  const [currentCard, setCurrentCard] = useState<BingoSquareState[]>([]);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winningPattern, setWinningPattern] = useState<number[]>([]);
  const { toast } = useToast();
  const [isLoadingMode, setIsLoadingMode] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect for loading phrases and game mode
  useEffect(() => {
    if (!isClient) {
      return;
    }

    let loadedPhrasesFlag = false;
    const urlPhrasesParam = searchParams.get('phrases');

    if (urlPhrasesParam) {
      try {
        const decodedPhrasesStr = decodeURIComponent(urlPhrasesParam);
        const phrasesFromUrl = decodedPhrasesStr.split(';;;').map(p => p.trim()).filter(p => p.length > 0);
        if (phrasesFromUrl.length > 0) {
          setPhrases(phrasesFromUrl);
          localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(phrasesFromUrl));
          toast({
            title: "Phrases Loaded from URL",
            description: "The custom phrases from the URL have been loaded.",
          });
          loadedPhrasesFlag = true;
        }
      } catch (error) {
        console.error("Failed to parse phrases from URL", error);
        toast({
          title: "Error Loading URL Phrases",
          description: "Using stored or default phrases.",
          variant: "destructive",
        });
      }
    }

    if (!loadedPhrasesFlag) {
      const storedPhrases = localStorage.getItem(PHRASES_STORAGE_KEY);
      if (storedPhrases) {
        try {
          const parsedPhrases = JSON.parse(storedPhrases);
          if (Array.isArray(parsedPhrases) && parsedPhrases.length > 0) {
            setPhrases(parsedPhrases);
            loadedPhrasesFlag = true;
          }
        } catch (error) {
          console.error("Failed to parse phrases from localStorage", error);
        }
      }
    }

    if (!loadedPhrasesFlag) {
      setPhrases(DEFAULT_PHRASES);
    }

    const storedMode = localStorage.getItem(GAME_MODE_STORAGE_KEY) as GameMode | null;
    if (storedMode && GAME_MODES.some(gm => gm.id === storedMode)) {
      setSelectedGameMode(storedMode);
    }
    setIsLoadingMode(false); // Finished attempting to load mode

  }, [isClient, searchParams, toast]);

  // Effect for redirection if no game mode is selected after loading
  useEffect(() => {
    if (isClient && !isLoadingMode && !selectedGameMode) {
      router.replace('/select-mode');
    }
  }, [isClient, isLoadingMode, selectedGameMode, router]);

  const startNewGame = useCallback(() => {
    if (!selectedGameMode) {
      toast({
        title: "Error",
        description: "No game mode selected. Please select a mode first.",
        variant: "destructive",
      });
      return;
    }
    const newCard = generateBingoCard(phrases, selectedGameMode);
    setCurrentCard(newCard);
    setGameStarted(true);
    setGameOver(false);
    setWinningPattern([]);
  }, [phrases, selectedGameMode, toast]);

  const handleSquareClick = (index: number) => {
    if (gameOver || !gameStarted || !selectedGameMode) return;

    const newCard = [...currentCard];
    const square = newCard[index];

    if (square.isFreeSpace && selectedGameMode === 'classic') return;

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
        action: <PartyPopper className="text-yellow-400" />,
        duration: 5000,
      });
    }
  };

  const handleResetToDefaults = () => {
    setPhrases(DEFAULT_PHRASES);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify(DEFAULT_PHRASES));
    }
    if (gameStarted) {
        setGameStarted(false);
        setGameOver(false);
        setCurrentCard([]);
        setWinningPattern([]);
    }
    toast({
      title: "Phrases Reset to Default",
      description: "The bingo phrases have been reset. You can start a new game with the default set.",
    });
  };

  if (!isClient || isLoadingMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <svg aria-hidden="true" className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <title>{!isClient ? "Loading Game" : "Loading Settings"}</title>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl text-muted-foreground mt-4">
          {!isClient ? "Loading game..." : "Loading game settings..."}
        </p>
      </div>
    );
  }
  
  // If selectedGameMode is null here, it means the redirection effect should handle it.
  // To avoid rendering the game UI momentarily before redirect, we can add another check,
  // or trust the redirect effect is fast enough. The spinner above should cover this.
  // For safety, if selectedGameMode is still null, it implies redirect is pending or failed.
  if (!selectedGameMode) {
      // This typically means we are about to redirect, or if redirection fails,
      // this prevents rendering the main game UI in an invalid state.
      // The loading spinner above should cover this brief period.
      return null; 
  }


  const requiredPhrasesCount = BINGO_CARD_TOTAL_SQUARES - (selectedGameMode === 'classic' && phrases.some(p => p.toUpperCase() === 'FREE') ? 0 : (selectedGameMode === 'classic' ? 1 : 0));
  const sufficientPhrases = phrases.length >= requiredPhrasesCount;
  const currentGameModeDetails = GAME_MODES.find(gm => gm.id === selectedGameMode);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center p-4 bg-card rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          {currentGameModeDetails?.name || 'Bingo'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">{currentGameModeDetails?.description}</p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/select-mode" className="flex items-center gap-1">
            <Settings2 className="h-4 w-4" /> Change Mode
          </Link>
        </Button>
      </div>

      {!sufficientPhrases && (
         <Alert variant="destructive" className="max-w-lg">
          <Trophy className="h-4 w-4" />
          <AlertTitle>Not Enough Phrases!</AlertTitle>
          <AlertDescription>
            You need at least {requiredPhrasesCount} unique phrases for {currentGameModeDetails?.name || 'the current'} mode. Please
            <Button variant="link" className="p-0 h-auto mx-1 text-base align-baseline" asChild>
              <Link href="/setup">add more phrases</Link>
            </Button>
            or use the
            <Button variant="link" className="p-0 h-auto mx-1 text-base align-baseline" onClick={handleResetToDefaults}>
              defaults
            </Button>.
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
          <h2 className="text-2xl font-semibold mb-4 text-primary">Ready to Play {currentGameModeDetails?.name || ''} Game?</h2>
          <p className="text-muted-foreground mb-6">
            Hit "Start Game" to begin the fun!
            { !sufficientPhrases && " You might want to set up your phrases first or use the defaults."}
          </p>
        </div>
      )}

      <div className="flex gap-4 items-center">
        <Button
          onClick={startNewGame}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={(!sufficientPhrases && !gameStarted) || !selectedGameMode}
        >
          {gameStarted ? <RefreshCcw className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {gameStarted ? (gameOver ? 'New Game' : 'Restart Game') : 'Start Game'}
        </Button>
      </div>

      {gameOver && (
        <div className="mt-4 p-6 bg-green-100 border-2 border-green-500 rounded-lg shadow-lg text-center max-w-md">
          <Trophy className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-green-700">Congratulations! You got BINGO!</h3>
          <p className="text-green-600 mt-2">Click "New Game" to play again with the same mode and phrases, or change mode.</p>
        </div>
      )}
    </div>
  );
}
