use serde::{Deserialize, Serialize};
use std::{fmt, str::FromStr};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Default, Serialize, Deserialize)]
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
    pub fn is_default(&self) -> bool {
        matches!(self, Self::Id)
    }
}

impl fmt::Display for Market {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl FromStr for Market {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_ascii_lowercase().as_str() {
            "id" => Ok(Self::Id),
            "sg" => Ok(Self::Sg),
            other => Err(format!("invalid market `{other}` expected id|sg")),
        }
    }
}
