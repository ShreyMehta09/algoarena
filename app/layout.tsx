import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

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
  icons: {
    icon: "/favicon.svg",
  },
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#22d3ee",
          colorText: "#e2e8f0",
        },
        elements: {
          card: "bg-dark-900 border border-white/[0.06] shadow-glass",
          headerTitle: "text-white",
          headerSubtitle: "text-slate-400",
          socialButtonsBlockButton: "border-white/[0.06] text-slate-300 hover:bg-white/5",
          formFieldLabel: "text-slate-300",
          formFieldInput: "bg-dark-800 border-white/[0.06] text-white focus:border-brand-cyan",
          footerActionText: "text-slate-400",
          footerActionLink: "text-brand-cyan hover:text-brand-cyan/80",
        }
      }}
    >
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
    </ClerkProvider>
  );
}
