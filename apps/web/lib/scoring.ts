export type ComponentBreakdown = {
  expected_return?: number;
  anomaly_z?: number;
  quality_value?: number;
  sector_mom?: number;
};

/**
 * Computes deterministic single-source-of-truth (SSOT) score from displayed rounded components.
 * Prevents dual-rounding mismatch between 4 individual component bars (rounded to 1 decimal)
 * and the aggregate mispricing score displayed on headers, ranking tables, and peer benchmarks.
 */
export function computeDisplayScore(
  rawScore: number | undefined,
  components?: ComponentBreakdown | null
): number {
  if (!components) return Number((rawScore ?? 0).toFixed(1));
  const er = components.expected_return !== undefined ? Number(components.expected_return.toFixed(1)) : null;
  const z = components.anomaly_z !== undefined ? Number(components.anomaly_z.toFixed(1)) : null;
  const qv = components.quality_value !== undefined ? Number(components.quality_value.toFixed(1)) : null;
  const sm = components.sector_mom !== undefined ? Number(components.sector_mom.toFixed(1)) : null;

  if (er !== null && z !== null && qv !== null && sm !== null) {
    return Number((0.30 * er + 0.20 * z + 0.30 * qv + 0.20 * sm).toFixed(1));
  }
  return Number((rawScore ?? 0).toFixed(1));
}
