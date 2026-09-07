use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct Components {
    pub expected_return: f32,
    pub anomaly_z: f32,
    pub quality_value: f32,
    pub sector_mom: f32,
}
