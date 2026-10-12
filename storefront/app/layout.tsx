import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "COCO-VANTAGE | Premium Charcoal & Cinnamon Formulations",
    template: "%s | COCO-VANTAGE",
  },
  description:
    "Architectural, minimal, and sophisticated formulations crafted from pure coconut charcoal and botanical cinnamon.",
  keywords: [
    "COCO-VANTAGE",
    "charcoal cinnamon",
    "botanical charcoal",
    "luxury wellness",
    "monochrome design",
  ],
  authors: [{ name: "COCO-VANTAGE" }],
};

import { CartProvider } from "@/lib/cart-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground tracking-tight" suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
