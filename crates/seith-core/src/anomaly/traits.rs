use serde::{Deserialize, Serialize};

const EPS: f32 = 1e-6;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct AnomalyInput {
    pub actual: f32,
    pub forecast: f32,
    pub sigma: f32,
    pub volume: f32,
    pub vol_mean: f32,
    pub vol_std: f32,
}

pub fn calc_z(actual: f32, forecast: f32, sigma: f32) -> f32 {
    if sigma.abs() < EPS {
        0.0
    } else {
        (actual - forecast) / sigma
    }
}

pub fn flag_z(z: f32) -> bool {
    z.abs() > 2.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calc_z_sigma_zero_no_panic() {
        assert_eq!(calc_z(100.0, 90.0, 0.0), 0.0);
        assert_eq!(calc_z(100.0, 90.0, 1e-9), 0.0);
    }

    #[test]
    fn calc_z_forecast_eq_actual_zero() {
        assert_eq!(calc_z(100.0, 100.0, 1.0), 0.0);
    }

    #[test]
    fn calc_z_normal() {
        assert!((calc_z(102.0, 100.0, 1.0) - 2.0).abs() < 1e-6);
    }

    #[test]
    fn flag_z_true_2_1() {
        assert!(flag_z(2.1));
        assert!(flag_z(-2.1));
    }

    #[test]
    fn flag_z_false_1_9() {
        assert!(!flag_z(1.9));
        assert!(!flag_z(-1.9));
    }

    #[test]
    fn flag_z_edge_2_0_false() {
        assert!(!flag_z(2.0));
        assert!(!flag_z(-2.0));
    }

    #[test]
    fn anomaly_input_round_trip() {
        let inp = AnomalyInput {
            actual: 102.0,
            forecast: 100.0,
            sigma: 1.0,
            volume: 125.0,
            vol_mean: 100.0,
            vol_std: 10.0,
        };
        let s = serde_json::to_string(&inp).unwrap();
        let d: AnomalyInput = serde_json::from_str(&s).unwrap();
        assert_eq!(d, inp);
    }

    #[test]
    fn anomaly_input_deny_unknown() {
        let j = r#"{"actual":1,"forecast":1,"sigma":1,"volume":1,"vol_mean":1,"vol_std":1,"unknown":1}"#;
        assert!(serde_json::from_str::<AnomalyInput>(j).is_err());
    }
}
