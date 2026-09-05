import "./globals.css";
export const metadata = { title: "SEITH | Market Intelligence IDX", description: "Mispricing Score 0-100 — derived insight for IDX" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#0B0E14] text-zinc-100 antialiased">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-[#11151F]/80 backdrop-blur">
          <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
            <span className="font-mono text-sm tracking-widest">SEITH</span>
            <span className="text-xs text-zinc-400">Bukan rekomendasi investasi</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <footer className="border-t border-zinc-800 py-3 text-center text-xs text-zinc-500">Bukan rekomendasi investasi — informasi & analisis saja</footer>
      </body>
    </html>
  );
}
