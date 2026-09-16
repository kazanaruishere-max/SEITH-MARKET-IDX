use serde_json::{json, Value};

pub const DISCLAIMER: &str = "Bukan rekomendasi investasi. Informasi & analisis saja.";

pub async fn load_backtest_value() -> Option<Value> {
    for cand in candidates() {
        if let Ok(s) = tokio::fs::read_to_string(&cand).await {
            if let Ok(v) = serde_json::from_str(&s) {
                return Some(v);
            }
        }
    }
    None
}

fn candidates() -> Vec<String> {
    let mut out = Vec::new();
    if let Ok(p) = std::env::var("SEITH_BACKTEST_PATH") {
        out.push(p);
    }
    out.push("research/backtest-100.json".to_string());
    out.push("../../research/backtest-100.json".to_string());
    out.push(format!(
        "{}/../../research/backtest-100.json",
        env!("CARGO_MANIFEST_DIR")
    ));
    out
}

pub fn db_counts() -> Option<(i64, i64)> {
    let path = "data/seith.db";
    let conn = rusqlite::Connection::open(path).ok()?;
    let o: i64 = conn
        .query_row("SELECT COUNT(*) FROM ohlcv", [], |r| r.get(0))
        .unwrap_or(0);
    let f: i64 = conn
        .query_row("SELECT COUNT(*) FROM fundamentals", [], |r| r.get(0))
        .unwrap_or(0);
    Some((o, f))
}
pub fn str_of(v: &Value, k: &str) -> String {
    v.get(k).and_then(|x| x.as_str()).unwrap_or("").to_string()
}

pub fn f64_of(v: &Value, k: &str) -> f64 {
    v.get(k).and_then(|x| x.as_f64()).unwrap_or(0.0)
}

pub fn z_of(item: &Value) -> f64 {
    item.get("anomaly")
        .and_then(|a| a.get("z"))
        .and_then(|z| z.as_f64())
        .unwrap_or(0.0)
}

pub fn flag_of(item: &Value) -> bool {
    item.get("anomaly")
        .and_then(|a| a.get("flag"))
        .and_then(|f| f.as_bool())
        .unwrap_or(false)
}

pub fn select_items(v: &Value, market: &str, sector: Option<&str>) -> Vec<Value> {
    v.get("items")
        .and_then(|x| x.as_array())
        .cloned()
        .unwrap_or_default()
        .into_iter()
        .filter(|it| str_of(it, "market") == market)
        .filter(|it| sector.map(|s| str_of(it, "sector") == s).unwrap_or(true))
        .collect()
}

pub fn sort_ranking(mut items: Vec<Value>, by_anomaly: bool, asc: bool) -> Vec<Value> {
    items.sort_by(|a, b| {
        let ord = if by_anomaly {
            z_of(a).abs().partial_cmp(&z_of(b).abs())
        } else {
            f64_of(a, "mispricingScore").partial_cmp(&f64_of(b, "mispricingScore"))
        }
        .unwrap_or(std::cmp::Ordering::Equal);
        ord.reverse()
    });
    if asc {
        items.reverse();
    }
    items
}

pub fn page_slice(items: &[Value], page: u32, page_size: u32) -> Vec<Value> {
    let start = ((page - 1) * page_size) as usize;
    items
        .iter()
        .skip(start)
        .take(page_size as usize)
        .cloned()
        .collect()
}

pub fn to_ranking_item(it: &Value, rank: usize) -> Value {
    json!({"ticker": str_of(it, "ticker"), "market": str_of(it, "market"), "sector": str_of(it, "sector"), "close": f64_of(it, "close"), "mispricingScore": f64_of(it, "mispricingScore"), "components": it.get("components").cloned().unwrap_or(json!({})), "anomalyFlag": flag_of(it), "anomalyZ": z_of(it), "rank": rank})
}

pub fn find_item(v: &Value, ticker: &str, market: &str) -> Option<Value> {
    v.get("items")?
        .as_array()?
        .iter()
        .find(|it| str_of(it, "ticker") == ticker && str_of(it, "market") == market)
        .cloned()
}

fn qv_of(it: &Value) -> f64 {
    it.get("components")
        .and_then(|c| c.get("quality_value"))
        .and_then(|x| x.as_f64())
        .unwrap_or(0.0)
}

fn peer_pool(
    v: &Value,
    target: &Value,
    same_sector: bool,
    enforce_cap: bool,
) -> Vec<(f64, f64, Value)> {
    let t_sector = str_of(target, "sector");
    let t_market = str_of(target, "market");
    let t_qv = qv_of(target);
    let t_close = f64_of(target, "close");
    v.get("items")
        .and_then(|x| x.as_array())
        .cloned()
        .unwrap_or_default()
        .into_iter()
        .filter(|it| str_of(it, "ticker") != str_of(target, "ticker"))
        .filter(|it| str_of(it, "market") == t_market)
        .filter(|it| !same_sector || str_of(it, "sector") == t_sector)
        .filter(|it| {
            if !enforce_cap {
                return true;
            }
            let c = f64_of(it, "close");
            if t_close <= 0.0 || c <= 0.0 {
                return true;
            }
            c >= t_close * 0.5 && c <= t_close * 1.5
        })
        .map(|it| ((qv_of(&it) - t_qv).abs(), z_of(&it).abs(), it))
        .collect()
}

fn sort_peers(mut peers: Vec<(f64, f64, Value)>) -> Vec<(f64, f64, Value)> {
    peers.sort_by(|a, b| {
        a.0.partial_cmp(&b.0)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then(b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal))
    });
    peers
}

fn peer_json(t_qv: f64, it: &Value) -> Value {
    json!({"ticker": str_of(it, "ticker"), "score": f64_of(it, "mispricingScore"), "market": str_of(it, "market"), "sector": str_of(it, "sector"), "qvDistance": (qv_of(it) - t_qv).abs()})
}

pub fn peer_five(v: &Value, target: &Value) -> Vec<Value> {
    let t_ticker = str_of(target, "ticker");
    let t_qv = qv_of(target);
    let mut picked = peer_pool(v, target, true, true);
    for (same_sector, enforce_cap) in [(true, false), (false, false)] {
        if picked.len() >= 5 {
            break;
        }
        let mut extra: Vec<(f64, f64, Value)> = peer_pool(v, target, same_sector, enforce_cap)
            .into_iter()
            .filter(|(_, _, it)| {
                let t = str_of(it, "ticker");
                t != t_ticker && !picked.iter().any(|(_, _, p)| str_of(p, "ticker") == t)
            })
            .collect();
        picked.append(&mut extra);
    }
    sort_peers(picked)
        .into_iter()
        .take(5)
        .map(|(_, _, it)| peer_json(t_qv, &it))
        .collect()
}

pub fn dossier_memo(it: &Value, peer_count: usize) -> String {
    format!(
        "Skor {:.1} rank {} sektor {} |Z|={:.1} flag={}. Peer {} same sector+market QV+cap±50%.",
        f64_of(it, "mispricingScore"),
        it.get("rank").and_then(|r| r.as_u64()).unwrap_or(0),
        str_of(it, "sector"),
        z_of(it),
        flag_of(it),
        peer_count
    )
}
