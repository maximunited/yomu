import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NextIntlClientProvider } from "next-intl";
import { DEFAULT_LOCALE, getMessages } from "@/i18n/messages";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YomU - יום-You | Birthday Benefits",
  description: "Discover and manage your birthday benefits from all your favorite brands",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = DEFAULT_LOCALE;
  const messages = getMessages(locale);

  return (
    <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <body className={inter.className}>
        <SessionProvider>
          <DarkModeProvider>
            <LanguageProvider>
              <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
              </NextIntlClientProvider>
            </LanguageProvider>
          </DarkModeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
