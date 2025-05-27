import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Puzzle } from 'lucide-react'; // Using Puzzle as a generic game icon

export default function Header() {
  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Puzzle className="h-8 w-8" />
          <span>Bingo Bonanza</span>
        </Link>
        <nav>
          <Button variant="ghost" asChild>
            <Link href="/setup">Setup Phrases</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
