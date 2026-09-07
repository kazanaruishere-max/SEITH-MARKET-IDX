pub mod traits;
pub mod volume;
pub use traits::{calc_z, flag_z, AnomalyInput};
pub use volume::{anomaly_flag, volume_spike, AnomalyOutput};
