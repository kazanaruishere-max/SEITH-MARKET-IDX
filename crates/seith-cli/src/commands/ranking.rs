use crate::cli::{envelope_err, envelope_ok};
use seith_core::market::Market;
use seith_core::ranking::service::{paginate, rank, Order, RankingRequest, SortKind};

pub fn run(market: Market, sector: Option<String>) -> String {
    let sector_str = sector.clone().unwrap_or_else(|| "FINANCE".to_string());
    let mut items = crate::pipeline::scored_all(&sector_str, market);
    if sector.is_none() {
        let extra = crate::pipeline::scored_all("FINANCE", market);
        if items.is_empty() && !extra.is_empty() {
            items = extra;
        }
    }
    let req = RankingRequest {
        market,
        sector: sector.clone(),
        sort: SortKind::Mispricing,
        order: Order::Desc,
        page: 1,
        page_size: 20,
    };
    let ranked = rank(&mut items, &req);
    let pag = paginate(&ranked, &req);
    let json_items: Vec<serde_json::Value> = pag
        .items
        .iter()
        .map(|r| {
            serde_json::json!({
                "ticker": r.ticker,
                "market": r.market.as_str(),
                "sector": r.sector,
                "mispricingScore": r.score,
                "rank": r.rank,
                "flag": r.flag
            })
        })
        .collect();
    let data = serde_json::json!({
        "market": market.as_str(),
        "sector": sector,
        "items": json_items,
        "pagination": {
            "page": pag.pagination.page,
            "pageSize": pag.pagination.page_size,
            "total": pag.pagination.total
        }
    });
    envelope_ok(data)
}

pub fn run_validated(raw_market: &str, sub_market: Option<&str>, sector: Option<String>) -> String {
    let m = match crate::cli::effective_market(raw_market, sub_market) {
        Ok(v) => v,
        Err(e) => return envelope_err("VALIDATION_ERROR", &e),
    };
    run(m, sector)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn ranking_sg_json() {
        let j = run_validated("sg", None, Some("FINANCE".to_string()));
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], true);
        assert_eq!(v["data"]["market"], "sg");
    }
    #[test]
    fn ranking_bad_market_422() {
        let j = run_validated("xx", None, None);
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], false);
        assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    }
    #[test]
    fn ranking_finance_has_items() {
        let j = run_validated("id", None, Some("FINANCE".to_string()));
        let v: serde_json::Value = serde_json::from_str(&j).unwrap();
        assert_eq!(v["success"], true);
        let items = v["data"]["items"].as_array().unwrap();
        assert!(items.len() >= 15, "FINANCE items {} <15", items.len());
        assert!(v["data"]["pagination"]["total"].as_u64().unwrap() >= 15);
        let first = items[0]["mispricingScore"].as_f64().unwrap();
        let last = items[items.len() - 1]["mispricingScore"].as_f64().unwrap();
        assert!(first >= last, "rank not desc");
    }
}
