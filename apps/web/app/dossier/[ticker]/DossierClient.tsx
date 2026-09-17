"use client";
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DossierDoc, type PdfDossier } from "@/components/DossierPDF";

export default function DossierClient({ ticker, market, lang, dossier }: { ticker: string; market: string; lang: string; dossier: PdfDossier }) {
  const [downloading, setDownloading] = useState(false);
  async function downloadBlob() {
    setDownloading(true);
    try {
      const r = await fetch(`/api/v1/tickers/${encodeURIComponent(ticker)}/dossier?market=${market}&format=pdf&lang=${lang}`);
      if (!r.ok) throw new Error(`pdf ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `SEITH-${ticker}-${market}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(false); }
  }
  return (
    <div className="flex gap-2">
      <button onClick={downloadBlob} disabled={downloading} className="rounded bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-50">{downloading ? "Menyiapkan..." : "Download PDF blob"}</button>
      <PDFDownloadLink document={<DossierDoc d={dossier} />} fileName={`SEITH-${ticker}-${market}.pdf`} className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900">
        {({ loading }) => (loading ? "Menyiapkan vector..." : "Download PDF vector")}
      </PDFDownloadLink>
    </div>
  );
}
