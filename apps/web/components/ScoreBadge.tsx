export function scoreColor(s: number) {
  const v = Math.max(0, Math.min(100, s));
  if (v > 70) return "bg-emerald-500 text-emerald-950 border-emerald-400";
  if (v >= 40) return "bg-amber-400 text-amber-950 border-amber-300";
  return "bg-red-500 text-white border-red-400";
}
export default function ScoreBadge({ score, anomaly }: { score: number; anomaly?: boolean }) {
  const v = Math.max(0, Math.min(100, score));
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${scoreColor(score)}`}>
      <span className="font-mono">{score.toFixed(1)}</span>
      <span className="text-[10px] opacity-70">/100</span>
      {anomaly ? <span title="anomaly flag" className="ml-0.5 h-1.5 w-1.5 rounded-full bg-current opacity-90 shadow" /> : null}
      <span className="ml-1 hidden text-[10px] font-semibold tracking-wide opacity-60 md:inline">{v > 70 ? "HIGH" : v >= 40 ? "MID" : "LOW"}</span>
    </span>
  );
}
