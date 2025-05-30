"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Puzzle, Settings, ListChecks, Play, Menu as MenuIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export default function Header() {
  const navLinks = [
    { href: "/", label: "Play Game", icon: Play },
    { href: "/select-mode", label: "Change Mode", icon: ListChecks },
    { href: "/setup", label: "Setup Phrases", icon: Settings },
  ];

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Puzzle className="h-8 w-8" />
          <span>Bingo Bonanza</span>
        </Link>

        {/* Desktop Navigation: Visible on md screens and up */}
        <nav className="hidden md:flex gap-1 sm:gap-2">
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

        {/* Mobile Navigation: Hamburger Menu, visible on screens smaller than md */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <nav className="flex flex-col space-y-3 pt-6">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 p-3 -m-3 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <link.icon className="h-5 w-5 text-primary" />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
