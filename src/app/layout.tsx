import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YomU - יום-You | Birthday Benefits",
  description: "Never miss a birthday deal again. Track all your birthday benefits, deals, and freebies in one place.",
  keywords: "birthday, benefits, deals, freebies, Israel, loyalty programs",
  authors: [{ name: "YomU Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <DarkModeProvider>
          <LanguageProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </LanguageProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
