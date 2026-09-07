export function scoreColor(s: number) {
  const v = Math.max(0, Math.min(100, s));
  if (v > 70) return "bg-emerald-500 text-emerald-950";
  if (v >= 40) return "bg-amber-400 text-amber-950";
  return "bg-red-500 text-white";
}
export default function ScoreBadge({ score, anomaly }: { score: number; anomaly?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${scoreColor(score)}`}>
      {score.toFixed(1)}
      {anomaly ? <span title="anomaly" className="h-1.5 w-1.5 rounded-full bg-current opacity-80" /> : null}
    </span>
  );
}
