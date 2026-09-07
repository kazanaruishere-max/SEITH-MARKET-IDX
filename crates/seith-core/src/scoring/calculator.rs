use crate::scoring::components::Components;

fn clamp(v: f32, lo: f32, hi: f32) -> f32 {
    v.clamp(lo, hi)
}

pub fn z_normalize(er: f32) -> f32 {
    if er.is_nan() {
        return 50.0;
    }
    if er.is_infinite() {
        return if er.is_sign_positive() { 100.0 } else { 0.0 };
    }
    clamp(er * 10.0 + 50.0, 0.0, 100.0)
}

pub fn qv_percentile(value: f32, sector_vals: &[f32]) -> f32 {
    if sector_vals.is_empty() {
        return 50.0;
    }
    let mut vals = sector_vals.to_vec();
    vals.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let cnt = vals.iter().filter(|&&v| v <= value).count();
    clamp(cnt as f32 / vals.len() as f32 * 100.0, 0.0, 100.0)
}

pub fn sector_mom(median: Option<f32>) -> f32 {
    match median {
        None => 50.0,
        Some(m) => {
            if m.is_nan() {
                return 50.0;
            }
            if m.is_infinite() {
                return if m.is_sign_positive() { 100.0 } else { 0.0 };
            }
            clamp(m * 10.0 + 50.0, 0.0, 100.0)
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct ScoreOutput {
    pub score: f32,
    pub components: Components,
}

pub fn compute(er: f32, anomaly_z: f32, qv: f32, sm: f32) -> ScoreOutput {
    let er_n = z_normalize(er);
    let zc = clamp(100.0 - anomaly_z.abs(), 0.0, 100.0);
    let zc = if zc.is_nan() { 50.0 } else { zc };
    let qv_c = if qv.is_nan() {
        50.0
    } else {
        clamp(qv, 0.0, 100.0)
    };
    let sm_c = if sm.is_nan() {
        50.0
    } else {
        clamp(sm, 0.0, 100.0)
    };
    let s = clamp(
        0.30 * er_n + 0.20 * zc + 0.30 * qv_c + 0.20 * sm_c,
        0.0,
        100.0,
    );
    ScoreOutput {
        score: s,
        components: Components {
            expected_return: er_n,
            anomaly_z: zc,
            quality_value: qv_c,
            sector_mom: sm_c,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn z_mid() {
        assert!((z_normalize(0.5) - 55.0).abs() < 1e-4);
    }
    #[test]
    fn z_neg() {
        assert!((z_normalize(-2.0) - 30.0).abs() < 1e-4);
    }
    #[test]
    fn z_inf_clamp() {
        assert_eq!(z_normalize(f32::INFINITY), 100.0);
        assert_eq!(z_normalize(f32::NEG_INFINITY), 0.0);
        assert_eq!(z_normalize(f32::NAN), 50.0);
    }
    #[test]
    fn qv_median() {
        let vals = [10.0, 20.0, 30.0, 40.0];
        assert!((qv_percentile(20.0, &vals) - 50.0).abs() < 1e-4);
    }
    #[test]
    fn qv_max() {
        let vals = [10.0, 20.0, 30.0, 40.0];
        assert!((qv_percentile(40.0, &vals) - 100.0).abs() < 1e-4);
    }
    #[test]
    fn qv_empty() {
        assert_eq!(qv_percentile(10.0, &[]), 50.0);
    }
    #[test]
    fn sm_none() {
        assert_eq!(sector_mom(None), 50.0);
    }
    #[test]
    fn sm_median() {
        assert!((sector_mom(Some(2.0)) - 70.0).abs() < 1e-4);
        assert_eq!(sector_mom(Some(f32::INFINITY)), 100.0);
    }
    #[test]
    fn compute_all_50() {
        let o = compute(0.0, 50.0, 50.0, 50.0);
        assert!((o.score - 50.0).abs() < 1e-4);
    }
    #[test]
    fn compute_clamp() {
        let o = compute(100.0, 0.0, 100.0, 100.0);
        assert!(o.score <= 100.0 && o.score >= 0.0);
        let o2 = compute(f32::INFINITY, f32::NAN, f32::NAN, f32::NAN);
        assert!(o2.score <= 100.0 && o2.score >= 0.0);
    }
}
