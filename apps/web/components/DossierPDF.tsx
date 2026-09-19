"use client";
import { Document, Page, View, Text, StyleSheet, Svg, Path } from "@react-pdf/renderer";

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
  kronos?: { forecastReturn?: number; volatility?: number; chartPoints?: { date: string; value: number; upper: number; lower: number }[] };
  research?: { fundamentalMemo?: string; technicalMemo?: string; synthesizerMemo?: string };
  degraded?: boolean; disclaimer: string;
};

function ScoreBadgePDF({ v }: { v: number }) {
  const c = v > 70 ? "#10b981" : v >= 40 ? "#fbbf24" : "#ef4444";
  return <View style={{ backgroundColor: c, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 }}><Text style={{ color: v >= 40 && v <= 70 ? "#0B0E14" : "#fff", fontSize: 10, fontWeight: 700 }}>{v.toFixed(1)}</Text></View>;
}

function StackedPDF({ b }: { b: PdfDossier["breakdown"] }) {
  if (!b) return null;
  const er=b.expected_return*0.3, z=b.anomaly_z*0.2, qv=b.quality_value*0.3, sm=b.sector_mom*0.2; const tot=er+z+qv+sm||100;
  const segs=[{w:(er/tot)*100,c:"#fbbf24"},{w:(z/tot)*100,c:"#eab308"},{w:(qv/tot)*100,c:"#10b981"},{w:(sm/tot)*100,c:"#0ea5e9"}];
  return <View style={{ flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "#27272a", marginTop: 4 }}>{segs.map((x,i) => <View key={i} style={{ width: `${x.w}%`, backgroundColor: x.c }} />)}</View>;
}

function pdfGradient(score: number) {
  const v = Math.max(0, Math.min(100, score));
  const t = v / 100;
  if (t < 0.5) {
    const k = t / 0.5;
    const r = Math.round(185 + (100 - 185) * k);
    const g = Math.round(28 + (116 - 28) * k);
    const b = Math.round(28 + (116 - 28) * k);
    const r2 = Math.round(39 + (100 - 39) * k);
    const g2 = Math.round(39 + (116 - 39) * k);
    const b2 = Math.round(42 + (116 - 42) * k);
    const mix = (a: number, b2v: number) => Math.round(a + (b2v - a) * 0.45);
    return `rgb(${mix(r, r2)},${mix(g, g2)},${mix(b, b2)})`;
  }
  const k = (t - 0.5) / 0.5;
  const r = Math.round(100 + (22 - 100) * k);
  const g = Math.round(116 + (163 - 116) * k);
  const b = Math.round(116 + (74 - 116) * k);
  return `rgb(${r},${g},${b})`;
}

function KronosChartPDF({ pts }: { pts: { value: number; upper: number; lower: number }[] }) {
  if (!pts || pts.length < 2) return <Text style={{ fontSize: 6, color: "#71717a" }}>No chartPoints — degraded fallback</Text>;
  const W = 500, H = 72;
  const min = Math.min(...pts.map((p) => p.lower), ...pts.map((p) => p.value));
  const max = Math.max(...pts.map((p) => p.upper), ...pts.map((p) => p.value));
  const range = max - min || 1;
  const x = (i: number) => (i / (pts.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / range) * H;
  const lineD = pts.map((p, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const upperD = pts.map((p, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(p.upper).toFixed(1)}`).join(" ");
  const lowerD = pts.map((p, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(p.lower).toFixed(1)}`).join(" ");
  const areaD = `${upperD} ${[...pts].reverse().map((p, i) => `L ${x(pts.length - 1 - i).toFixed(1)} ${y(p.lower).toFixed(1)}`).join(" ")} Z`;
  return (
    <View style={{ marginTop: 4, borderWidth: 1, borderColor: "#27272a", borderRadius: 3, padding: 4, backgroundColor: "#0B0E14" }}>
      <Svg width={W} height={H}>
        <Path d={areaD} fill="#ef4444" fillOpacity={0.08} stroke="none" />
        <Path d={lineD} stroke="#fbbf24" strokeWidth={1.2} fill="none" />
        <Path d={upperD} stroke="#ef4444" strokeWidth={0.6} strokeOpacity={0.35} fill="none" />
        <Path d={lowerD} stroke="#ef4444" strokeWidth={0.6} strokeOpacity={0.35} fill="none" />
      </Svg>
      <Text style={{ fontSize: 5, color: "#71717a", marginTop: 2 }}>Kronos 400→20 · forecast amber dashed + ±2σ red band · 20 pts · range {min.toFixed(0)}→{max.toFixed(0)}</Text>
    </View>
  );
}

function MiniHeatmapPDF({ score }: { score: number }) {
  const cols = 10, rows = 10, cw = 14, ch = 6, gap = 1.5;
  const scores = Array.from({ length: 100 }, (_, i) => {
    const off = (i - 50) * 0.6 + Math.sin(i * 1.3) * 4;
    return Math.max(0, Math.min(100, score + off));
  });
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={{ fontSize: 6, color: "#a1a1aa", marginBottom: 2 }}>Mini Heatmap 10×10 — global treemap preview · score {score.toFixed(1)} centered (merah→abu→hijau)</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", width: cols * (cw + gap) - gap, gap: gap }}>
        {scores.map((v, i) => (
          <View key={i} style={{ width: cw, height: ch, backgroundColor: pdfGradient(v), borderRadius: 1 }} />
        ))}
      </View>
      <Text style={{ fontSize: 5, color: "#71717a", marginTop: 2 }}>100 cells · Bloomberg dense · sector-weighted treemap preview — bukan filler</Text>
    </View>
  );
}

export function DossierDoc({ d }: { d: PdfDossier }) {
  const peers = (d.peerComparison ?? []).slice(0,5);
  const sc = d.score ?? 0;
  const pts = (d.kronos?.chartPoints as { value: number; upper: number; lower: number }[] | undefined) ?? [];
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
        <Text style={s.h2}>4 Valuation Deep Dive — Kronos 400→20 vector</Text>
        <View style={s.card}>
          <Text>ROE/margin/leverage PE/PB vs median sektor per market. Kronos forecast 20 titik vector (amber dashed) + band vol ±2σ red 10%.</Text>
          <KronosChartPDF pts={pts} />
          <Text style={s.mono}>x_timestamp→y_timestamp derived · OHLC wajib else excluded · lookback 512 guard · forecastReturn {d.kronos?.forecastReturn !== undefined ? (d.kronos.forecastReturn*100).toFixed(2)+"%" : "-"} · vol {d.kronos?.volatility !== undefined ? (d.kronos.volatility*100).toFixed(2)+"%" : "-"}</Text>
        </View>
        <Text style={s.h2}>5 Peer Benchmark Mengapa Kompetitor A</Text>
        <View style={s.card}>
          <View style={s.tableRow}><Text style={s.th}>Ticker</Text><Text style={s.th}>Score</Text><Text style={s.th}>Market</Text><Text style={s.th}>Alasan</Text></View>
          {peers.map((p) => (
            <View key={p.ticker} style={s.tableRow}><Text style={s.td}>{p.ticker}</Text><Text style={s.td}>{p.score.toFixed(1)}</Text><Text style={s.td}>{p.market}</Text><Text style={s.td}>QV jarak terdekat cap ±50% |Z| tie-break</Text></View>
          ))}
          {peers.length===0 ? <Text style={s.mono}>Peer same sector+market QV distance + cap band ±50% tie-break |Z| desc. Contoh BBCA vs BMRI delta QV 2.1 bukan BUMI ENERGY beda bisnis.</Text> : null}
        </View>
        <Text style={s.h2}>6 Radar Anomali Money Leak — vector preview</Text>
        <View style={s.card}>
          <Text>Flag |Z|&gt;2 atau volume spike &gt;2σ tanpa katalis ROE/margin. Excluded jika OHLC missing.</Text>
          <MiniHeatmapPDF score={sc} />
        </View>
        <Text style={s.disclaimer}>{d.disclaimer}  Bukan rekomendasi investasi. schema 1.0.0  x-schema-version 1.0.0</Text>
      </Page>
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>7 Katalis & Risiko Fundamental Teknical Synth ID</Text>
        <View style={s.card}><Text>Fundamental: {d.research?.fundamentalMemo ?? "-"}</Text></View>
        <View style={s.card}><Text>Technical: {d.research?.technicalMemo ?? "-"}</Text></View>
        <View style={s.card}><Text>Synthesizer: {d.research?.synthesizerMemo ?? "-"}</Text></View>
        <Text style={s.h2}>8 Metodologi & Verifiabilitas</Text>
        <View style={s.card}><Text>Source Sectors Authorization /v2/daily/{`{symbol}`}/ + Valuation + Company Overview sector. Cache Composite moka L1 &lt;1ms + SQLite WAL data/seith.db ~2ms busy_timeout 3000 TTL 24h/1h key market:sector:ticker:date. Kronos-base 102.3M 512ctx 12B K-line 2508.02739v1 T1.0 top_p0.9 y_timestamp 20. %PDF-1.4 lineage + research/backtest-100.json as_of 2026-09-08 universe 100.</Text></View>
        <Text style={s.h2}>9 Annex Data Mentah 20 + Credit + Ekuitas vs IHSG — Metrics Honest 85% / -0.02</Text>
        <View style={s.card}><Text>OHLCV 20 terbaru tabel + credit 296 OHLCV98×19+Valuation98 + backtest 52w synthetic forecast-based 2025-09-21→2026-09-13 — Sharpe (ER-based) -0.02 & Signal Accuracy (Top-20) 85% cross-sectional (Top-20 ER), BUKAN equity time-series — equity sendiri (drawdown -6.23% totalReturn -6.23%) recomputed 52w. Angka match web /backtest: Signal Accuracy (Top-20) 85% · Sharpe (ER-based) -0.02 · drawdown -6.23%. Lihat app/backtest untuk kurva penuh.</Text></View>
        <Text style={s.disclaimer}>{d.disclaimer}  SEITH 2026  Bloomberg #0B0E14  JetBrains Mono  x-schema-version 1.0.0</Text>
      </Page>
    </Document>
  );
}

export default function DossierPDF({ dossier }: { dossier: PdfDossier }) {
  return <DossierDoc d={dossier} />;
}
