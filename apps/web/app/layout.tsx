import "./globals.css";
import Link from "next/link";
export const metadata = {
  title: "SEITH — Market Intelligence IDX · Artificial Analysis × TradingView grade",
  description: "Mispricing 0-100 · Anomaly Rank · Dossier 1-page · Sectors CORE · Kronos 400→20",
  openGraph: { title: "SEITH — Market Intelligence IDX", description: "Mispricing 0-100 derived insight for IDX" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#0B0E14] text-zinc-100 antialiased selection:bg-amber-400 selection:text-zinc-900">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-amber-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-900">Skip to content</a>
        <header className="sticky top-0 z-30 border-b border-[#24242e]/80 bg-[#0B0E14]/80 glass supports-[backdrop-filter]:bg-[#0B0E14]/60">
          <div className="mx-auto flex h-[52px] max-w-[1360px] items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex items-center gap-5">
              <Link href="/" className="flex items-center gap-3 group">
                <span className="rounded-[6px] bg-amber-400 px-2 py-1 font-mono text-xs font-extrabold tracking-[0.18em] text-zinc-900 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] group-hover:bg-amber-300 transition-colors">SEITH</span>
                <span className="hidden flex-col leading-none md:flex">
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-zinc-100">MARKET INTELLIGENCE</span>
                  <span className="text-[11px] tracking-wide text-zinc-500">IDX · Sectors 100 · Kronos</span>
                </span>
              </Link>
              <span className="hidden h-6 w-px bg-zinc-800 md:block" />
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-900/50 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-medium text-emerald-300 md:inline-flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE 100</span>
            </div>
            <nav className="flex items-center gap-1 text-[13px]">
              <Link href="/ranking" className="rounded-full px-3.5 py-1.5 font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Ranking</Link>
              <Link href="/backtest" className="rounded-full px-3.5 py-1.5 font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Backtest</Link>
              <Link href="/dossier/BBCA?market=id" className="rounded-full px-3.5 py-1.5 font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Dossier</Link>
              <span className="ml-1 hidden rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[10px] leading-none tracking-wide text-zinc-400 md:inline">Bukan rekomendasi investasi</span>
            </nav>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-[1360px] px-4 py-6 md:px-6 md:py-8">{children}</main>
        <footer className="border-t border-[#24242e]/60 py-6">
          <div className="mx-auto max-w-[1360px] px-4 md:px-6">
            <div className="flex flex-col gap-2 text-xs leading-relaxed text-zinc-500 md:flex-row md:items-center md:justify-between">
              <span>Bukan rekomendasi investasi — informasi &amp; analisis saja · Sectors CORE · Kronos 400→20 · 30/20/30/20 · CompositeCache L1+L2</span>
              <span className="flex gap-3 font-mono text-[11px]"><a href="/api/v1/health" className="hover:text-zinc-300">/health</a><span className="text-zinc-700">·</span><span>schema 1.0.0</span></span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
