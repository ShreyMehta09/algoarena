import Navbar from "@/components/navbar";
import GlobalNotifier from "@/components/GlobalNotifier";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-950 bg-grid">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <GlobalNotifier />
    </div>
  );
}
