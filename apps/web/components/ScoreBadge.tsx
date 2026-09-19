export function scoreColor(s: number) {
  const v = Math.max(0, Math.min(100, s));
  if (v > 70) return "bg-emerald-950/80 text-emerald-300 border-emerald-500/50";
  if (v >= 40) return "bg-amber-950/80 text-amber-300 border-amber-500/50";
  return "bg-red-950/80 text-red-300 border-red-500/50";
}

export default function ScoreBadge({ score, anomaly }: { score: number; anomaly?: boolean }) {
  const v = Math.max(0, Math.min(100, score));
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-0.5 font-mono text-[11px] font-bold ${scoreColor(
        score
      )}`}
    >
      <span>{score.toFixed(1)}</span>
      {anomaly ? (
        <span title="Anomaly Flagged" className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-sm" />
      ) : null}
      <span className="text-[9px] opacity-70 hidden sm:inline">
        {v > 70 ? "HI" : v >= 40 ? "MID" : "LOW"}
      </span>
    </span>
  );
}
