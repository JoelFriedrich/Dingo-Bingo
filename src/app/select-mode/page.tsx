
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GameModeSelector from '@/components/bingo/GameModeSelector';
import type { GameMode } from '@/types/bingo';
import { GAME_MODES, GAME_MODE_STORAGE_KEY } from '@/types/bingo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Settings } from 'lucide-react';
import Link from 'next/link';

export default function SelectModePage() {
  const router = useRouter();
  const [currentSelectedMode, setCurrentSelectedMode] = useState<GameMode>(GAME_MODES[0].id); // Default to first mode
  const [hasExistingGame, setHasExistingGame] = useState<boolean>(false);

  useEffect(() => {
    const storedMode = localStorage.getItem(GAME_MODE_STORAGE_KEY);
    if (storedMode && GAME_MODES.some(gm => gm.id === storedMode)) {
        setHasExistingGame(true);
        // Optionally pre-select the stored mode if you want it to reflect the current game's mode
        // setCurrentSelectedMode(storedMode as GameMode); 
    }
  }, []);


  const handleModeSelection = (mode: GameMode) => {
    setCurrentSelectedMode(mode);
  };

  const handlePlayWithMode = () => {
    localStorage.setItem(GAME_MODE_STORAGE_KEY, currentSelectedMode);
    router.push('/');
  };

  const selectedModeDetails = GAME_MODES.find(gm => gm.id === currentSelectedMode);

  return (
    <div className="container mx-auto py-8 flex flex-col items-center gap-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Choose Your Bingo Adventure!</CardTitle>
          <CardDescription>Select a game mode below. Your choice will be saved for your next game.</CardDescription>
        </CardHeader>
        <CardContent>
          <GameModeSelector
            selectedMode={currentSelectedMode}
            onModeChange={handleModeSelection}
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <Button onClick={handlePlayWithMode} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
            <PlayCircle className="mr-2 h-5 w-5" />
            Play {selectedModeDetails?.name || 'Selected Mode'}
          </Button>
          {hasExistingGame && (
             <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                <Link href="/">Return to Game</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
       <Button variant="link" asChild>
        <Link href="/setup" className="flex items-center gap-1">
            <Settings className="h-4 w-4" /> Customize Phrases
        </Link>
      </Button>
    </div>
  );
}
