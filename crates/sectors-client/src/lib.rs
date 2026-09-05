use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Default)]
pub enum Market {
    #[default]
    #[serde(rename = "id")]
    Id,
    #[serde(rename = "sg")]
    Sg,
}

impl Market {
    pub fn as_str(&self) -> &str {
        match self {
            Self::Id => "id",
            Self::Sg => "sg",
        }
    }
    pub fn base_path(&self) -> &str {
        match self {
            Self::Id => "/v2/indonesia/transaction/daily",
            Self::Sg => "/v2/singapore/transaction/daily",
        }
    }
}
