import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getSiteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "PanRybka.pl — blog wędkarski", template: "%s | PanRybka.pl" },
  description: "Testy sprzętu wędkarskiego, poradniki i łowiska — PanRybka.pl",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased [font-family:var(--font-inter),system-ui,sans-serif]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
