import type { Metadata } from "next";
import "./globals.css";
import { AuthListener } from "@/components/auth/AuthListener";
import { ThemeManager } from "@/components/layout/ThemeManager";

export const metadata: Metadata = {
  title: "LexiFlow - Premium Word Learning Experience",
  description: "Step into a world of words with LexiFlow. An immersive, playful platform designed to help you master vocabulary through interactive flashcards and spelling games.",
  keywords: ["word learning", "vocabulary", "english learning", "flashcards", "educational app"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script src="/runtime-config.js" />
      </head>
      <body className="antialiased min-h-screen bg-[var(--background)]">
        <ThemeManager />
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
