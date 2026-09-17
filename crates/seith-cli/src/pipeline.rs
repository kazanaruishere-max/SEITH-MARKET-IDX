use seith_core::market::Market;
use seith_core::models::Fundamentals;
use seith_core::ranking::service::ScoredTicker;

pub fn mean_std(vals: &[f64]) -> (f32, f32) {
    if vals.is_empty() {
        return (0.0, 0.0);
    }
    let n = vals.len() as f64;
    let mean = vals.iter().sum::<f64>() / n;
    let var = vals.iter().map(|v| (v - mean).powi(2)).sum::<f64>() / n;
    (mean as f32, var.sqrt() as f32)
}

pub fn ma_proxy(closes: &[f64]) -> f32 {
    if closes.is_empty() {
        return 0.0;
    }
    let (mean, _) = mean_std(closes);
    if mean == 0.0 {
        return 0.0;
    }
    let last = *closes.last().unwrap() as f32;
    (last - mean) / mean
}

pub fn qv_for(f: &Fundamentals, peers: &[Fundamentals]) -> f32 {
    if peers.is_empty() {
        return 50.0;
    }
    let collect = |get: fn(&Fundamentals) -> Option<f64>| {
        peers
            .iter()
            .filter_map(|p| get(p).map(|v| v as f32))
            .collect::<Vec<f32>>()
    };
    let roe_v = collect(|p| p.roe);
    let marg_v = collect(|p| p.margin);
    let lev_v = collect(|p| p.leverage);
    let pe_v = collect(|p| p.pe);
    let pb_v = collect(|p| p.pb);
    let roe = seith_core::scoring::calculator::qv_percentile(f.roe.unwrap_or(0.0) as f32, &roe_v);
    let marg =
        seith_core::scoring::calculator::qv_percentile(f.margin.unwrap_or(0.0) as f32, &marg_v);
    let lev = 100.0
        - seith_core::scoring::calculator::qv_percentile(f.leverage.unwrap_or(0.0) as f32, &lev_v);
    let pe =
        100.0 - seith_core::scoring::calculator::qv_percentile(f.pe.unwrap_or(0.0) as f32, &pe_v);
    let pb =
        100.0 - seith_core::scoring::calculator::qv_percentile(f.pb.unwrap_or(0.0) as f32, &pb_v);
    let vals = [roe, marg, lev, pe, pb];
    let avg = vals.iter().sum::<f32>() / vals.len() as f32;
    if avg.is_nan() {
        50.0
    } else {
        avg.clamp(0.0, 100.0)
    }
}

fn sector_mom_from_peers(market: Market, sector: &str) -> f32 {
    let peers = crate::store::load_sector_fundamentals(sector, market);
    if peers.is_empty() {
        return seith_core::scoring::calculator::sector_mom(None);
    }
    let mut ers = Vec::new();
    for p in &peers {
        let rows = crate::store::load_ohlcv(&p.ticker, market);
        if rows.is_empty() {
            continue;
        }
        let closes: Vec<f64> = rows.iter().map(|r| r.close).collect();
        let er = ma_proxy(&closes);
        if er.is_finite() {
            ers.push(er);
        }
    }
    if ers.is_empty() {
        return seith_core::scoring::calculator::sector_mom(None);
    }
    ers.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let median = ers[ers.len() / 2];
    seith_core::scoring::calculator::sector_mom(Some(median))
}

fn anomaly_and_reason(
    last: f32,
    forecast: f32,
    sigma: f32,
    vols: &[f64],
) -> (f32, bool, Option<String>) {
    let (vol_mean, vol_std) = mean_std(vols);
    let last_vol = vols.last().copied().unwrap_or(0.0) as f32;
    let z = seith_core::anomaly::traits::calc_z(last, forecast, sigma);
    let input = seith_core::anomaly::traits::AnomalyInput {
        actual: last,
        forecast,
        sigma,
        volume: last_vol,
        vol_mean,
        vol_std,
    };
    let out = seith_core::anomaly::volume::anomaly_flag(&input);
    let reason = if out.reason.is_empty() {
        None
    } else {
        Some(out.reason)
    };
    (z, out.flag, reason)
}

pub fn scored_for(ticker: &str, market: Market) -> Option<ScoredTicker> {
    crate::store::ensure_populated();
    let raw = crate::store::load_ohlcv(ticker, market);
    if raw.is_empty() {
        return None;
    }
    let cleansed = seith_core::normalize::cleanse_ohlcv(raw);
    if cleansed.rows.is_empty() {
        return None;
    }
    let closes: Vec<f64> = cleansed.rows.iter().map(|r| r.close).collect();
    if closes.len() < 5 {
        return None;
    }
    let (mean, std) = mean_std(&closes);
    let last = *closes.last().unwrap() as f32;
    // ponytail: MA20 proxy pending Kronos 400->20
    let er = ma_proxy(&closes);
    let f_raw = crate::store::load_fundamentals(ticker, market)?;
    let sector = f_raw.sector.clone();
    let median = seith_core::normalize::sector_median(&sector, market);
    let (f_clean, _) = seith_core::normalize::cleanse_fundamentals(f_raw, &median);
    let peers = crate::store::load_sector_fundamentals(&sector, market);
    let qv = qv_for(&f_clean, &peers);
    let sm = sector_mom_from_peers(market, &sector);
    let vols: Vec<f64> = cleansed
        .rows
        .iter()
        .map(|r| r.volume.unwrap_or(0.0))
        .collect();
    let (z, flag, reason) = anomaly_and_reason(last, mean, std, &vols);
    let out = seith_core::scoring::calculator::compute(er, z, qv, sm);
    Some(ScoredTicker {
        ticker: ticker.to_string(),
        market,
        sector,
        score: out.score,
        components: out.components,
        anomaly_z: z,
        flag,
        reason,
    })
}

#[allow(dead_code)]
pub fn scored_all(sector: &str, market: Market) -> Vec<ScoredTicker> {
    crate::store::ensure_populated();
    let tickers = crate::store::list_tickers(sector, market);
    let mut out = Vec::new();
    for t in tickers {
        if let Some(s) = scored_for(&t, market) {
            out.push(s);
        }
    }
    out
}
