import type { Metadata } from 'next';
import { GeistSans } from 'next/font/google'; // Corrected import
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';

const geistSans = GeistSans({ // Corrected variable name
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// GeistMono is not explicitly used but kept for consistency if needed later
// const geistMono = GeistMono({ 
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'Bingo Bonanza',
  description: 'Play digital Bingo with friends!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
        <footer className="py-4 text-center text-sm text-muted-foreground border-t">
          © {new Date().getFullYear()} Bingo Bonanza. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
