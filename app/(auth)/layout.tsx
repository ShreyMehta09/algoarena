export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-950 bg-grid flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed top-1/4 left-1/3 w-80 h-80 bg-brand-purple/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-80 h-80 bg-brand-cyan/6 rounded-full blur-3xl pointer-events-none" />
      {children}
    </div>
  );
}
