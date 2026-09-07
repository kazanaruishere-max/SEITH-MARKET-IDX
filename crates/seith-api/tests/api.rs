use axum::body::Body;
use axum::http::{Request, StatusCode};
use chrono::{TimeZone, Utc};
use http_body_util::BodyExt;
use seith_api::envelope::Envelope;
use seith_api::repository::{Repository, SqliteRepository};
use seith_core::market::Market;
use seith_core::models::OhlcvRow;
use serde_json::Value;
use tower::ServiceExt;

fn app() -> axum::Router {
    seith_api::router_memory()
}

async fn body_json(resp: axum::response::Response) -> Value {
    let bytes = resp.into_body().collect().await.unwrap().to_bytes();
    serde_json::from_slice(&bytes).unwrap()
}

#[tokio::test]
async fn health_200_envelope() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let v = body_json(resp).await;
    assert_eq!(v["success"], true);
    assert_eq!(v["data"]["status"], "ok");
}

#[tokio::test]
async fn health_header_schema_version() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.headers().get("x-schema-version").unwrap(), "1.0.0");
}

#[tokio::test]
async fn ranking_market_sg_200() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/ranking?market=sg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let h = resp
        .headers()
        .get("x-schema-version")
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    let v = body_json(resp).await;
    assert_eq!(h, "1.0.0");
    assert_eq!(v["success"], true);
    assert_eq!(v["data"]["market"], "sg");
}

#[tokio::test]
async fn ranking_market_default_id_200() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/ranking")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let v = body_json(resp).await;
    assert_eq!(v["data"]["market"], "id");
}

#[tokio::test]
async fn ranking_market_invalid_422() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/ranking?market=xx")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
    let h = resp
        .headers()
        .get("x-schema-version")
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    let v = body_json(resp).await;
    assert_eq!(v["success"], false);
    assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    assert_eq!(h, "1.0.0");
}

#[tokio::test]
async fn ranking_lookback_over_512_422() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/ranking?lookback=520")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
    let v = body_json(resp).await;
    assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
}

#[tokio::test]
async fn repository_memory_round_trip() {
    let repo = SqliteRepository::new("file:itest_mem_roundtrip2?mode=memory&cache=shared");
    let row = OhlcvRow {
        ticker: "BBCA".to_string(),
        market: Market::Id,
        date: Utc.with_ymd_and_hms(2024, 1, 2, 0, 0, 0).unwrap(),
        open: 1.0,
        high: 1.0,
        low: 1.0,
        close: 1.0,
        volume: Some(100.0),
        amount: Some(100.0),
        x_timestamp: None,
        y_timestamp: None,
    };
    let n = repo.save_ohlcv(&[row]).unwrap();
    assert_eq!(n, 1);
    let got = repo.get_ohlcv(Market::Id, "BBCA").unwrap();
    assert_eq!(got.len(), 1);
}

#[tokio::test]
async fn contract_cli_rest_envelope_identical() {
    let rest = Envelope::ok(serde_json::json!({"ticker":"BBCA","market":"id"}));
    let cli_json = serde_json::to_string(&rest).unwrap();
    let cli: Envelope<Value> = serde_json::from_str(&cli_json).unwrap();
    assert!(cli.success);
    assert_eq!(cli.data.unwrap()["ticker"], "BBCA");
}

#[tokio::test]
async fn ranking_page_size_clamp_50() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/ranking?market=sg&pageSize=100")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let v = body_json(resp).await;
    assert_eq!(v["pagination"]["pageSize"], 50);
    assert_eq!(
        v["data"]["disclaimer"],
        "Bukan rekomendasi investasi. Informasi & analisis saja."
    );
}

#[tokio::test]
async fn ranking_sort_bad_422() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/ranking?sort=bad")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
    assert_eq!(resp.headers().get("x-schema-version").unwrap(), "1.0.0");
}

#[tokio::test]
async fn ranking_unknown_field_422() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/ranking?unknown=1")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn score_bbca_jk_normalized_200() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/tickers/BBCA.JK/score")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let h = resp
        .headers()
        .get("x-schema-version")
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    let v = body_json(resp).await;
    assert_eq!(h, "1.0.0");
    assert_eq!(v["data"]["ticker"], "BBCA");
    assert_eq!(
        v["data"]["disclaimer"],
        "Bukan rekomendasi investasi. Informasi & analisis saja."
    );
}

#[tokio::test]
async fn score_bogus_404() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/tickers/BOGUS/score")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::NOT_FOUND);
    let v = body_json(resp).await;
    assert_eq!(v["error"]["code"], "TICKER_NOT_FOUND");
}

#[tokio::test]
async fn dossier_pdf_header() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/tickers/BBCA/dossier?format=pdf")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.headers().get("x-schema-version").unwrap(), "1.0.0");
    assert_eq!(
        resp.headers().get("content-type").unwrap(),
        "application/pdf"
    );
    let bytes = resp.into_body().collect().await.unwrap().to_bytes();
    assert!(bytes.starts_with(b"%PDF"));
}

#[tokio::test]
async fn anomalies_market_xx_422() {
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/anomalies?market=xx")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn scan_excluded_present() {
    let body = serde_json::json!({"tickers":["BBCA","bad!"],"market":"id"});
    let resp = app()
        .oneshot(
            Request::builder()
                .uri("/api/v1/scan")
                .method("POST")
                .header("content-type", "application/json")
                .body(Body::from(body.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let v = body_json(resp).await;
    assert_eq!(v["data"]["excluded"][0]["ticker"], "bad!");
    assert_eq!(v["data"]["degraded"], true);
}
