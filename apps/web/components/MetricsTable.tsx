export type Metrics = { hit_rate?: number; sharpe?: number; drawdown?: number; top5_forward_20d?: number; totalReturn?: number; cumulative?: number; win_rate?: number };
const cells: { k: keyof Metrics; label: string; fmt: (v: number) => string }[] = [
  { k: "hit_rate", label: "Hit rate", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "win_rate", label: "Win rate", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "sharpe", label: "Sharpe", fmt: (v) => v.toFixed(1) },
  { k: "drawdown", label: "Drawdown", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "top5_forward_20d", label: "Top5 fwd 20d", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "totalReturn", label: "Total return", fmt: (v) => `${(v * 100).toFixed(0)}%` },
];
export default function MetricsTable({ m }: { m: Metrics }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#11151F]">
      <div className="border-b border-zinc-800 px-3 py-2 text-xs uppercase tracking-wide text-zinc-400">Metrics · universe 100</div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-zinc-800">
          {cells.map((c) => (
            <tr key={c.k}>
              <td className="px-3 py-2 text-zinc-400">{c.label}</td>
              <td className="px-3 py-2 text-right font-mono">{m[c.k] !== undefined ? c.fmt(m[c.k] as number) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
