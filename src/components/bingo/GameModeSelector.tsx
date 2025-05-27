"use client";

import type { GameMode } from '@/types/bingo';
import { GAME_MODES } from '@/types/bingo';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export default function GameModeSelector({ selectedMode, onModeChange, disabled = false }: GameModeSelectorProps) {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Select Game Mode</CardTitle>
        <CardDescription>Choose how you want to play Bingo!</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMode}
          onValueChange={(value) => onModeChange(value as GameMode)}
          className="grid gap-4"
          disabled={disabled}
        >
          {GAME_MODES.map((mode) => (
            <Label
              key={mode.id}
              htmlFor={mode.id}
              className={`flex flex-col items-start space-y-1 rounded-md border p-4 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer
                ${selectedMode === mode.id ? 'bg-primary/10 border-primary ring-2 ring-primary' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={mode.id} id={mode.id} disabled={disabled}/>
                <span className="font-semibold text-lg">{mode.name}</span>
              </div>
              <p className="text-sm text-muted-foreground pl-7">{mode.description}</p>
            </Label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
