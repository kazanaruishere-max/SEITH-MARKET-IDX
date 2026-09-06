import os

from fastapi import FastAPI

from .predictor import get_device, predict, predict_batch
from .schemas import PredictBatchRequest, PredictRequest

app = FastAPI(title="kronos-sidecar")


@app.get("/health")
def health():
    is_mock = os.getenv("KRONOS_MOCK", "0") == "1"
    model = "mock" if is_mock else "Kronos-base"
    return {"status": "ok", "model": model, "max_context": 512, "device": get_device()}


@app.post("/predict")
def predict_endpoint(req: PredictRequest):
    pred = predict(req.df, req.x_timestamp, req.y_timestamp, req.pred_len, req.T, req.top_p)
    return {"pred_df": pred, "degraded": False}


@app.post("/predict_batch")
def predict_batch_endpoint(req: PredictBatchRequest):
    preds = predict_batch(req.dfs, req.x_timestamps, req.y_timestamps, req.pred_len, req.T, req.top_p)
    return {"pred_dfs": preds, "degraded": False}
