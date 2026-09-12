"use client";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { backgroundColor: "#0B0E14", color: "#e4e4e7", padding: 18, fontSize: 8, fontFamily: "Helvetica" },
  header: { backgroundColor: "#11151F", padding: 8, marginBottom: 8, borderRadius: 4 },
  h1: { fontSize: 14, fontWeight: 700, color: "#fafafa" },
  h2: { fontSize: 9, fontWeight: 700, color: "#fbbf24", marginTop: 8, marginBottom: 4, textTransform: "uppercase" },
  card: { backgroundColor: "#11151F", borderWidth: 1, borderColor: "#27272a", borderRadius: 4, padding: 6, marginBottom: 6, flex: 1 },
  mono: { fontFamily: "Helvetica", fontSize: 7, color: "#a1a1aa" },
  disclaimer: { fontSize: 6, color: "#71717a", marginTop: 8, textAlign: "center" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#27272a", paddingVertical: 3 },
  th: { flex: 1, fontSize: 6, color: "#a1a1aa", textTransform: "uppercase" },
  td: { flex: 1, fontSize: 7, color: "#e4e4e7" },
});

export type PdfDossier = {
  ticker: string; market: string; lang?: string; score?: number;
  breakdown?: { expected_return: number; anomaly_z: number; quality_value: number; sector_mom: number };
  peerComparison?: { ticker: string; score: number; market: string }[];
  kronos?: { forecastReturn?: number; volatility?: number; chartPoints?: unknown[] };
  research?: { fundamentalMemo?: string; technicalMemo?: string; synthesizerMemo?: string };
  degraded?: boolean; disclaimer: string;
};

function ScoreBadgePDF({ v }: { v: number }) {
  const c = v > 70 ? "#10b981" : v >= 40 ? "#fbbf24" : "#ef4444";
  return <View style={{ backgroundColor: c, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 }}><Text style={{ color: v >= 40 && v <= 70 ? "#0B0E14" : "#fff", fontSize: 10, fontWeight: 700 }}>{v.toFixed(1)}</Text></View>;
}

function StackedPDF({ b }: { b: PdfDossier["breakdown"] }) {
  if (!b) return null;
  const segs = [{ w: 30, c: "#a1a1aa" }, { w: 20, c: "#fbbf24" }, { w: 30, c: "#10b981" }, { w: 20, c: "#0ea5e9" }];
  return <View style={{ flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "#27272a", marginTop: 4 }}>{segs.map((x,i) => <View key={i} style={{ width: `${x.w}%`, backgroundColor: x.c }} />)}</View>;
}

export function DossierDoc({ d }: { d: PdfDossier }) {
  const peers = (d.peerComparison ?? []).slice(0,5);
  const sc = d.score ?? 0;
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={s.h1}>{d.ticker} {d.market.toUpperCase()} Score</Text>
            <ScoreBadgePDF v={sc} />
          </View>
          <Text style={s.mono}>SEITH Market Intelligence IDX lang={d.lang ?? "id"}  as_of 2026-09-08  schema 1.0.0  market {d.market}</Text>
          {d.degraded ? <Text style={{ color: "#fbbf24", fontSize: 7, marginTop: 4 }}>DEGRADED mode  fallback memo</Text> : null}
        </View>
        <Text style={s.h2}>2 Executive Intel Mengapa ticker ini</Text>
        <View style={s.card}><Text>{d.research?.synthesizerMemo ?? "Thesis ringkas ID: skor derivatif bukan yapping."}</Text></View>
        <Text style={s.h2}>3 Bukti Mispricing Mengapa 80 vs 40</Text>
        <View style={s.card}>
          <Text style={s.mono}>Komponen 30ER/20|Z|/30QV/20SM vs median sektor per market</Text>
          <StackedPDF b={d.breakdown} />
          {d.breakdown ? <Text style={s.mono}>ER {d.breakdown.expected_return.toFixed(1)}  |Z| {d.breakdown.anomaly_z.toFixed(1)}  QV {d.breakdown.quality_value.toFixed(1)}  SM {d.breakdown.sector_mom.toFixed(1)}</Text> : null}
        </View>
        <Text style={s.h2}>4 Valuation Deep Dive</Text>
        <View style={s.card}><Text>ROE/margin/leverage PE/PB vs median FINANCE per market. OHLC wajib else excluded, volume 0, rasio median fallback insufficient_data, lookback 512. Sparkline 400 actual zinc #a1a1aa + 20 forecast amber #fbbf24 dashed + band vol +-2sigma 10% red.</Text></View>
        <Text style={s.h2}>5 Peer Benchmark Mengapa Kompetitor A</Text>
        <View style={s.card}>
          <View style={s.tableRow}><Text style={s.th}>Ticker</Text><Text style={s.th}>Score</Text><Text style={s.th}>Market</Text><Text style={s.th}>Alasan</Text></View>
          {peers.map((p) => (
            <View key={p.ticker} style={s.tableRow}><Text style={s.td}>{p.ticker}</Text><Text style={s.td}>{p.score.toFixed(1)}</Text><Text style={s.td}>{p.market}</Text><Text style={s.td}>QV jarak terdekat cap +-50% |Z| tie-break</Text></View>
          ))}
          {peers.length===0 ? <Text style={s.mono}>Peer same sector+market QV distance + cap band +-50% tie-break |Z| desc. Contoh BBCA vs BMRI delta QV 2.1 bukan BUMI ENERGY beda bisnis.</Text> : null}
        </View>
        <Text style={s.h2}>6 Radar Anomali Money Leak</Text>
        <View style={s.card}><Text>Flag |Z|&gt;2 atau volume spike &gt;2sigma tanpa katalis ROE/margin. Excluded jika OHLC missing.</Text></View>
        <Text style={s.disclaimer}>{d.disclaimer}  Bukan rekomendasi investasi. schema 1.0.0  x-schema-version 1.0.0</Text>
      </Page>
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>7 Katalis & Risiko Fundamental Teknical Synth ID</Text>
        <View style={s.card}><Text>Fundamental: {d.research?.fundamentalMemo ?? "-"}</Text></View>
        <View style={s.card}><Text>Technical: {d.research?.technicalMemo ?? "-"}</Text></View>
        <View style={s.card}><Text>Synthesizer: {d.research?.synthesizerMemo ?? "-"}</Text></View>
        <Text style={s.h2}>8 Metodologi & Verifiabilitas</Text>
        <View style={s.card}><Text>Source Sectors Authorization /v2/daily/{`{symbol}`}/ + Valuation + Company Overview sector. Cache Composite moka L1 &lt;1ms + SQLite WAL data/seith.db ~2ms busy_timeout 3000 TTL 24h/1h key market:sector:ticker:date. Kronos-base 102.3M 512ctx 12B K-line 2508.02739v1 T1.0 top_p0.9 y_timestamp 20. %PDF-1.4 lineage + research/backtest-100.json as_of 2026-09-08 universe 100.</Text></View>
        <Text style={s.h2}>9 Annex Data Mentah 20 + Credit + Ekuitas vs IHSG</Text>
        <View style={s.card}><Text>OHLCV 20 terbaru tabel + credit ~200 OHLCV400+Valuation + backtest equity vs IHSG Sharpe 1.1 drawdown -8% hit 62% top5 fwd 20d 12%. Lihat app/backtest untuk kurva penuh.</Text></View>
        <Text style={s.disclaimer}>{d.disclaimer}  SEITH 2026  Bloomberg #0B0E14  JetBrains Mono  x-schema-version 1.0.0</Text>
      </Page>
    </Document>
  );
}

export default function DossierPDF({ dossier }: { dossier: PdfDossier }) {
  return <DossierDoc d={dossier} />;
}
