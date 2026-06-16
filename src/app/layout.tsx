import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { heIL } from '@clerk/localizations';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YomU - יום-You | Birthday Benefits',
  description:
    'Discover and manage your birthday benefits from all your favorite brands',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <ClerkProvider localization={heIL}>
          <DarkModeProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </DarkModeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
