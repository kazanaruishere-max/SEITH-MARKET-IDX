use crate::anomaly::traits::{calc_z, flag_z, AnomalyInput};
use serde::{Deserialize, Serialize};
const EPS: f32 = 1e-6;
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct AnomalyOutput {
    pub flag: bool,
    pub reason: String,
}
pub fn volume_spike(volume: f32, mean: f32, std: f32) -> bool {
    if std.abs() < EPS {
        return false;
    }
    (volume - mean) / std > 2.0
}
pub fn anomaly_flag(input: &AnomalyInput) -> AnomalyOutput {
    let z = calc_z(input.actual, input.forecast, input.sigma);
    let fz = flag_z(z);
    let vs = volume_spike(input.volume, input.vol_mean, input.vol_std);
    let flag = fz || vs;
    let reason = if !flag {
        String::new()
    } else {
        let mut parts = Vec::new();
        if fz {
            parts.push(format!("z={z:.1}"));
        }
        if vs {
            parts.push("vol>2σ".to_string());
        }
        parts.join("|")
    };
    AnomalyOutput { flag, reason }
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::anomaly::traits::AnomalyInput;
    fn inp(
        actual: f32,
        forecast: f32,
        sigma: f32,
        volume: f32,
        mean: f32,
        std: f32,
    ) -> AnomalyInput {
        AnomalyInput {
            actual,
            forecast,
            sigma,
            volume,
            vol_mean: mean,
            vol_std: std,
        }
    }
    #[test]
    fn volume_spike_true_125() {
        assert!(volume_spike(125.0, 100.0, 10.0));
    }
    #[test]
    fn volume_spike_false_115() {
        assert!(!volume_spike(115.0, 100.0, 10.0));
    }
    #[test]
    fn volume_spike_std_zero_false() {
        assert!(!volume_spike(200.0, 100.0, 0.0));
        assert!(!volume_spike(200.0, 100.0, 1e-9));
    }
    #[test]
    fn volume_spike_edge_2_0_false() {
        assert!(!volume_spike(120.0, 100.0, 10.0));
    }
    #[test]
    fn anomaly_flag_z_only() {
        let o = anomaly_flag(&inp(103.0, 100.0, 1.0, 100.0, 100.0, 10.0));
        assert!(o.flag);
        assert!(o.reason.contains("z"));
        assert!(!o.reason.contains("vol"));
    }
    #[test]
    fn anomaly_flag_vol_only() {
        let o = anomaly_flag(&inp(100.0, 100.0, 1.0, 125.0, 100.0, 10.0));
        assert!(o.flag);
        assert!(o.reason.contains("vol"));
    }
    #[test]
    fn anomaly_flag_combined() {
        let o = anomaly_flag(&inp(103.0, 100.0, 1.0, 125.0, 100.0, 10.0));
        assert!(o.flag);
        assert!(o.reason.contains("z"));
        assert!(o.reason.contains("vol"));
        assert!(o.reason.contains("|"));
    }
    #[test]
    fn anomaly_flag_none() {
        let o = anomaly_flag(&inp(100.0, 100.0, 1.0, 100.0, 100.0, 10.0));
        assert!(!o.flag);
        assert_eq!(o.reason, "");
    }
    #[test]
    fn anomaly_flag_sigma_zero_no_panic_vol_false() {
        let o = anomaly_flag(&inp(100.0, 90.0, 0.0, 100.0, 100.0, 0.0));
        assert!(!o.flag);
        assert_eq!(o.reason, "");
    }
    #[test]
    fn anomaly_output_round_trip() {
        let o = AnomalyOutput {
            flag: true,
            reason: "z=2.5|vol>2σ".to_string(),
        };
        let s = serde_json::to_string(&o).unwrap();
        let d: AnomalyOutput = serde_json::from_str(&s).unwrap();
        assert_eq!(d, o);
    }
}
