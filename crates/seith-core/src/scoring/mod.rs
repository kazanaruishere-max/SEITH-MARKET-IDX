pub mod calculator;
pub mod components;
pub use calculator::ScoreOutput;
pub use calculator::{compute, qv_percentile, sector_mom, z_normalize};
pub use components::Components;

#[cfg(test)]
mod tests {
    use super::components::Components;
    #[test]
    fn deny_unknown() {
        let j = r#"{"expected_return":50.0,"anomaly_z":50.0,"quality_value":50.0,"sector_mom":50.0,"unknown":1}"#;
        assert!(serde_json::from_str::<Components>(j).is_err());
    }
    #[test]
    fn round_trip() {
        let c = Components {
            expected_return: 55.0,
            anomaly_z: 80.0,
            quality_value: 50.0,
            sector_mom: 70.0,
        };
        let s = serde_json::to_string(&c).unwrap();
        let d: Components = serde_json::from_str(&s).unwrap();
        assert_eq!(d, c);
    }
}
