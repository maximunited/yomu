import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { heIL } from '@clerk/localizations';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YomU - יום-You | Birthday Benefits',
  description:
    'Discover and manage your birthday benefits from all your favorite brands',
  applicationName: 'YomU',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'YomU',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
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
            <LanguageProvider>
              {children}
              <ServiceWorkerRegister />
            </LanguageProvider>
          </DarkModeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
