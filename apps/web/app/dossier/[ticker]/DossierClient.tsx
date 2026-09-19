"use client";
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DossierDoc, type PdfDossier } from "@/components/DossierPDF";

export default function DossierClient({ ticker, market, lang, dossier }: { ticker: string; market: string; lang: string; dossier: PdfDossier }) {
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function downloadBlob() {
    setDownloading(true);
    setErr(null);
    try {
      const q = new URLSearchParams({ market, format: "pdf", lang });
      const r = await fetch(`/api/v1/tickers/${encodeURIComponent(ticker)}/dossier?${q.toString()}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SEITH-${ticker}-${market}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal mengunduh berkas PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <button
          onClick={downloadBlob}
          disabled={downloading}
          className="rounded-[3px] border border-amber-400 bg-amber-400 px-3 py-1 text-xs font-mono font-bold text-zinc-900 hover:bg-amber-300 disabled:opacity-50 transition-colors"
        >
          {downloading ? "MENYIAPKAN..." : "EXPORT PDF (BLOB)"}
        </button>
        <PDFDownloadLink
          document={<DossierDoc d={dossier} />}
          fileName={`SEITH-${ticker}-${market}.pdf`}
          className="rounded-[3px] border border-[#1E2638] bg-[#0D111A] px-3 py-1 text-xs font-mono font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
        >
          {({ loading }) => (loading ? "MENYIAPKAN VECTOR..." : "EXPORT PDF (VECTOR)")}
        </PDFDownloadLink>
      </div>
      {err ? (
        <span className="font-mono text-[10px] text-red-400">Error: {err}</span>
      ) : null}
    </div>
  );
}
