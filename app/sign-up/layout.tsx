import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-purple">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-white">Algo</span>
            <span className="text-gradient">Arena</span>
          </span>
        </Link>
      </div>
      {children}
    </div>
  );
}
