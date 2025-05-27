import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Puzzle, Settings, ListChecks, Play } from 'lucide-react'; 

export default function Header() {
  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Puzzle className="h-8 w-8" />
          <span>Bingo Bonanza</span>
        </Link>
        <nav className="flex gap-1 sm:gap-2">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-1 text-sm sm:text-base">
              <Play className="h-4 w-4" />
              Play
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/select-mode" className="flex items-center gap-1 text-sm sm:text-base">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Change </span>Mode
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/setup" className="flex items-center gap-1 text-sm sm:text-base">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Setup </span>Phrases
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
