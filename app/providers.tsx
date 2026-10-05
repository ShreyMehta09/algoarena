"use client";

// ClerkProvider is now in the root layout (server component).
// This providers file is kept for any future client-only providers.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
