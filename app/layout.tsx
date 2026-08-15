import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AlgoArena – Real-Time Competitive Coding Platform",
    template: "%s | AlgoArena",
  },
  description:
    "Battle coders in real-time 1v1 matches. Elo-based matchmaking, Monaco editor, automated judging, and live leaderboards.",
  keywords: [
    "competitive programming",
    "coding battles",
    "1v1 coding",
    "algorithm practice",
    "Elo rating",
    "code editor",
  ],
  openGraph: {
    title: "AlgoArena – Real-Time Competitive Coding Platform",
    description: "Battle coders in real-time 1v1 matches.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-dark-950 text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
