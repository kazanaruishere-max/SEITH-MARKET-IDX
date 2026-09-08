use std::fmt;
use std::str::FromStr;

#[derive(
    Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize, Default,
)]
#[serde(rename_all = "lowercase")]
pub enum Market {
    #[default]
    Id,
    Sg,
}

impl Market {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Id => "id",
            Self::Sg => "sg",
        }
    }

    pub fn base_path(&self) -> &'static str {
        match self {
            Self::Id => "/v2/daily",
            Self::Sg => "/v2/sgx/daily",
        }
    }

    pub fn is_default(&self) -> bool {
        matches!(self, Self::Id)
    }
}

impl fmt::Display for Market {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("invalid market '{0}', expected id|sg")]
pub struct MarketParseError(pub String);

impl FromStr for Market {
    type Err = MarketParseError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_ascii_lowercase().as_str() {
            "id" => Ok(Self::Id),
            "sg" => Ok(Self::Sg),
            _ => Err(MarketParseError(s.to_string())),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn default_is_id() {
        assert_eq!(Market::default(), Market::Id);
        assert!(Market::default().is_default());
    }

    #[test]
    fn as_str_and_display() {
        assert_eq!(Market::Id.as_str(), "id");
        assert_eq!(Market::Sg.as_str(), "sg");
        assert_eq!(Market::Id.to_string(), "id");
        assert_eq!(Market::Sg.to_string(), "sg");
    }

    #[test]
    fn base_path_per_market() {
        assert_eq!(Market::Id.base_path(), "/v2/daily");
        assert_eq!(Market::Sg.base_path(), "/v2/sgx/daily");
    }

    #[test]
    fn from_str_case_insensitive() {
        assert_eq!("id".parse::<Market>().unwrap(), Market::Id);
        assert_eq!("ID".parse::<Market>().unwrap(), Market::Id);
        assert_eq!("Id".parse::<Market>().unwrap(), Market::Id);
        assert_eq!("sg".parse::<Market>().unwrap(), Market::Sg);
        assert_eq!("SG".parse::<Market>().unwrap(), Market::Sg);
        assert_eq!("Sg".parse::<Market>().unwrap(), Market::Sg);
    }

    #[test]
    fn from_str_invalid() {
        assert!("xx".parse::<Market>().is_err());
        assert!("".parse::<Market>().is_err());
        assert!("idx".parse::<Market>().is_err());
    }

    #[test]
    fn serde_round_trip() {
        for m in [Market::Id, Market::Sg] {
            let s = serde_json::to_string(&m).unwrap();
            assert_eq!(s, format!("\"{}\"", m.as_str()));
            let d: Market = serde_json::from_str(&s).unwrap();
            assert_eq!(d, m);
        }
        let sg: Market = serde_json::from_str("\"sg\"").unwrap();
        assert_eq!(sg, Market::Sg);
        let id: Market = serde_json::from_str("\"id\"").unwrap();
        assert_eq!(id, Market::Id);
    }

    #[test]
    fn hash_map_keyed_by_market() {
        let mut map: HashMap<Market, &str> = HashMap::new();
        map.insert(Market::Id, "idx");
        map.insert(Market::Sg, "sti");
        assert_eq!(map[&Market::Id], "idx");
        assert_eq!(map[&Market::Sg], "sti");
    }

    #[test]
    fn sg_not_default() {
        assert!(!Market::Sg.is_default());
    }
}
