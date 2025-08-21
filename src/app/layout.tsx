import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YomU - יום-You | Birthday Benefits",
  description:
    "Discover and manage your birthday benefits from all your favorite brands",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <SessionProvider>
          <DarkModeProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </DarkModeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
