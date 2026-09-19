import "./globals.css";
import Link from "next/link";
import { fetchRanking } from "@/lib/api";
import TickerTape, { type TapeItem } from "@/components/TickerTape";
import QuickSearch from "@/components/QuickSearch";

export const metadata = {
  title: "SEITH — Bloomberg × TradingView Grade Market Intelligence for IDX",
  description: "Mispricing 0-100 · Anomaly Rank · Dossier 1-page · Sectors CORE · Kronos 400→20",
  openGraph: { title: "SEITH — Market Intelligence IDX", description: "Mispricing 0-100 derived insight for IDX" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let tapeItems: TapeItem[] = [];
  try {
    const r = await fetchRanking({ market: "id", pageSize: 12 });
    tapeItems = ((r.data as { items: TapeItem[] }).items ?? []).map((x) => ({
      ticker: x.ticker,
      close: x.close,
      mispricingScore: x.mispricingScore,
      rank: x.rank,
      anomalyFlag: x.anomalyFlag,
    }));
  } catch (err) {
    if ((err as { digest?: string })?.digest !== "DYNAMIC_SERVER_USAGE") {
      console.error("[RootLayout] Failed to fetch ticker tape items:", err);
    }
  }

  return (
    <html lang="id">
      <body className="min-h-screen bg-[#07090E] text-[#E2E8F0] antialiased selection:bg-amber-400 selection:text-zinc-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-[4px] focus:bg-amber-400 focus:px-3 focus:py-1.5 focus:font-mono focus:text-xs focus:font-bold focus:text-zinc-900"
        >
          Skip to content
        </a>

        {/* TradingView Real Ticker Tape */}
        <TickerTape items={tapeItems} />

        {/* Bloomberg Command Header */}
        <header className="sticky top-0 z-40 border-b border-[#1E2638] bg-[#07090E]/90 glass">
          <div className="mx-auto flex h-[48px] max-w-[1440px] items-center justify-between gap-3 px-3 sm:px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="rounded-[3px] bg-amber-400 px-2 py-0.5 font-mono text-xs font-black tracking-widest text-zinc-900 group-hover:bg-amber-300 transition-colors shadow-sm">
                  SEITH
                </span>
                <span className="hidden flex-col leading-none sm:flex">
                  <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-zinc-200">
                    TERMINAL // MI
                  </span>
                  <span className="text-[10px] tracking-tight text-zinc-500">
                    IDX · KRONOS 400→20
                  </span>
                </span>
              </Link>
              <span className="hidden h-5 w-px bg-[#1E2638] sm:block" />
              <div className="hidden lg:block">
                <QuickSearch />
              </div>
            </div>

            <div className="flex lg:hidden flex-1 justify-center max-w-xs">
              <QuickSearch />
            </div>

            <nav className="flex items-center gap-1.5 font-mono text-xs">
              <Link
                href="/ranking"
                className="rounded-[3px] border border-transparent px-2.5 py-1 text-zinc-300 hover:border-[#1E2638] hover:bg-[#0D111A] hover:text-white transition-colors"
              >
                <span className="text-zinc-500 mr-1">F1</span>RANK
              </Link>
              <Link
                href="/backtest"
                className="rounded-[3px] border border-transparent px-2.5 py-1 text-zinc-300 hover:border-[#1E2638] hover:bg-[#0D111A] hover:text-white transition-colors"
              >
                <span className="text-zinc-500 mr-1">F2</span>BKST
              </Link>
              <Link
                href="/dossier/BBCA?market=id"
                className="rounded-[3px] border border-transparent px-2.5 py-1 text-zinc-300 hover:border-[#1E2638] hover:bg-[#0D111A] hover:text-white transition-colors"
              >
                <span className="text-zinc-500 mr-1">F3</span>DOSS
              </Link>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-[3px] border border-emerald-900/50 bg-emerald-950/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" /> LIVE
              </span>
            </nav>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-6 py-4 md:py-6">
          {children}
        </main>

        <footer className="border-t border-[#1E2638] bg-[#07090E] py-4 text-[11px] text-zinc-500">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-3 sm:px-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <span className="font-semibold text-zinc-400">Bukan rekomendasi investasi</span> — Informasi &amp; analisis saja · Sectors CORE · Kronos 400→20 · CompositeCache L1+L2
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <a href="/api/v1/health" className="hover:text-zinc-300 transition-colors">
                SYS: /health
              </a>
              <span className="text-zinc-700">·</span>
              <span>SCHEMA 1.0.0</span>
              <span className="text-zinc-700">·</span>
              <span className="text-amber-400/90 font-bold">BLOOMBERG × TRADINGVIEW</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
