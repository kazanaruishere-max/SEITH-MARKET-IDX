use serde::{Deserialize, Serialize};

use crate::market::Market;
use crate::scoring::components::Components;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SortKind {
    Mispricing,
    Anomaly,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Order {
    Desc,
    Asc,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RankingRequest {
    pub market: Market,
    pub sector: Option<String>,
    pub sort: SortKind,
    pub order: Order,
    pub page: u32,
    pub page_size: u32,
}

impl Default for RankingRequest {
    fn default() -> Self {
        Self {
            market: Market::Id,
            sector: None,
            sort: SortKind::Mispricing,
            order: Order::Desc,
            page: 1,
            page_size: 20,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct ValidationError {
    pub code: String,
    pub message: String,
}

impl RankingRequest {
    pub fn validate(&self) -> Result<(), ValidationError> {
        if self.page == 0 {
            return Err(ValidationError {
                code: "VALIDATION_ERROR".to_string(),
                message: "page must be >=1".to_string(),
            });
        }
        if self.page_size == 0 || self.page_size > 50 {
            return Err(ValidationError {
                code: "VALIDATION_ERROR".to_string(),
                message: "page_size must be 1..=50".to_string(),
            });
        }
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct ScoredTicker {
    pub ticker: String,
    pub market: Market,
    pub sector: String,
    pub score: f32,
    pub components: Components,
    pub anomaly_z: f32,
    pub flag: bool,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct RankedTicker {
    pub rank: u32,
    pub ticker: String,
    pub market: Market,
    pub sector: String,
    pub score: f32,
    pub flag: bool,
}

pub trait ScoreRepository: Send + Sync {
    fn rank(&self, items: Vec<ScoredTicker>, req: &RankingRequest) -> PaginatedResult;
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Pagination {
    pub page: u32,
    #[serde(rename = "pageSize")]
    pub page_size: u32,
    pub total: u64,
}

#[derive(Debug, Clone)]
pub struct PaginatedResult {
    pub items: Vec<RankedTicker>,
    pub pagination: Pagination,
}

pub fn sector_filter(items: &[ScoredTicker], sector: &str) -> Vec<ScoredTicker> {
    items
        .iter()
        .filter(|x| x.sector == sector)
        .cloned()
        .collect()
}

pub fn rank(items: &mut [ScoredTicker], req: &RankingRequest) -> Vec<RankedTicker> {
    match req.sort {
        SortKind::Mispricing => items.sort_by(|a, b| {
            let ord = a
                .score
                .partial_cmp(&b.score)
                .unwrap_or(std::cmp::Ordering::Equal);
            let ord = if req.order == Order::Desc {
                ord.reverse()
            } else {
                ord
            };
            if ord != std::cmp::Ordering::Equal {
                return ord;
            }
            let zord = a
                .anomaly_z
                .abs()
                .partial_cmp(&b.anomaly_z.abs())
                .unwrap_or(std::cmp::Ordering::Equal)
                .reverse();
            if zord != std::cmp::Ordering::Equal {
                return zord;
            }
            a.ticker.cmp(&b.ticker)
        }),
        SortKind::Anomaly => items.sort_by(|a, b| {
            let ord = a
                .anomaly_z
                .abs()
                .partial_cmp(&b.anomaly_z.abs())
                .unwrap_or(std::cmp::Ordering::Equal);
            let ord = if req.order == Order::Desc {
                ord.reverse()
            } else {
                ord
            };
            if ord != std::cmp::Ordering::Equal {
                return ord;
            }
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        }),
    }
    items
        .iter()
        .enumerate()
        .map(|(i, s)| RankedTicker {
            rank: (i + 1) as u32,
            ticker: s.ticker.clone(),
            market: s.market,
            sector: s.sector.clone(),
            score: s.score,
            flag: s.flag,
        })
        .collect()
}

pub fn paginate(ranked: &[RankedTicker], req: &RankingRequest) -> PaginatedResult {
    let total = ranked.len() as u64;
    let start = ((req.page - 1) * req.page_size) as usize;
    let end = (start + req.page_size as usize).min(ranked.len());
    let items = if start >= ranked.len() {
        Vec::new()
    } else {
        ranked[start..end].to_vec()
    };
    PaginatedResult {
        items,
        pagination: Pagination {
            page: req.page,
            page_size: req.page_size,
            total,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn scored(ticker: &str, sector: &str, score: f32, z: f32) -> ScoredTicker {
        ScoredTicker {
            ticker: ticker.to_string(),
            market: Market::Id,
            sector: sector.to_string(),
            score,
            components: Components {
                expected_return: 50.0,
                anomaly_z: 50.0,
                quality_value: 50.0,
                sector_mom: 50.0,
            },
            anomaly_z: z,
            flag: false,
            reason: None,
        }
    }
    fn req(page: u32, size: u32) -> RankingRequest {
        RankingRequest {
            page,
            page_size: size,
            ..Default::default()
        }
    }
    #[test]
    fn sort_desc() {
        let mut v = vec![
            scored("BBCA", "FINANCE", 10.0, 0.0),
            scored("BMRI", "FINANCE", 90.0, 0.0),
        ];
        let r = rank(&mut v, &req(1, 20));
        assert_eq!(r[0].ticker, "BMRI");
        assert_eq!(r[1].ticker, "BBCA");
    }
    #[test]
    fn paginate_page1_size2_total3() {
        let mut v = vec![
            scored("A", "FINANCE", 30.0, 0.0),
            scored("B", "FINANCE", 20.0, 0.0),
            scored("C", "FINANCE", 10.0, 0.0),
        ];
        let ranked = rank(&mut v, &req(1, 20));
        let pag = paginate(&ranked, &req(1, 2));
        assert_eq!(pag.pagination.total, 3);
        assert_eq!(pag.items.len(), 2);
        let pag2 = paginate(&ranked, &req(2, 2));
        assert_eq!(pag2.items.len(), 1);
    }
    #[test]
    fn page_beyond_empty() {
        let mut v = vec![scored("A", "FINANCE", 30.0, 0.0)];
        let ranked = rank(&mut v, &req(1, 20));
        let pag = paginate(
            &ranked,
            &RankingRequest {
                page: 10,
                page_size: 20,
                ..Default::default()
            },
        );
        assert!(pag.items.is_empty());
        assert_eq!(pag.pagination.total, 1);
    }
    #[test]
    fn sector_filter_only_fin() {
        let v = vec![
            scored("A", "FINANCE", 30.0, 0.0),
            scored("B", "ENERGY", 20.0, 0.0),
            scored("C", "FINANCE", 10.0, 0.0),
        ];
        let f = sector_filter(&v, "FINANCE");
        assert_eq!(f.len(), 2);
        assert!(f.iter().all(|x| x.sector == "FINANCE"));
    }
    #[test]
    fn validation_page_size_51() {
        let r = RankingRequest {
            page_size: 51,
            ..Default::default()
        };
        assert!(r.validate().is_err());
        let r2 = RankingRequest {
            page: 0,
            ..Default::default()
        };
        assert!(r2.validate().is_err());
    }
}
