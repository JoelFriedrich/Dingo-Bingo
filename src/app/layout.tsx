import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Dingo Bingo',
  description: 'Play digital Bingo with friends!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="py-4 text-center text-sm text-muted-foreground border-t">
          © {new Date().getFullYear()} Dingo Bingo. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
