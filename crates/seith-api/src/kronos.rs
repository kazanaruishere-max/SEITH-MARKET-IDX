use seith_core::kronos::{
    BatchOutput, KronosClient, KronosError, KronosRepository, PredictBatchInput, PredictInput,
    PredictOutput,
};

pub struct KronosService {
    client: KronosClient,
}

impl KronosService {
    pub fn new(base_url: impl Into<String>) -> Result<Self, KronosError> {
        Ok(Self {
            client: KronosClient::new(base_url)?,
        })
    }

    pub fn from_client(client: KronosClient) -> Self {
        Self { client }
    }
}

impl KronosRepository for KronosService {
    async fn predict(&self, input: PredictInput) -> Result<PredictOutput, KronosError> {
        self.client.predict(input).await
    }

    async fn predict_batch(&self, input: PredictBatchInput) -> Result<BatchOutput, KronosError> {
        self.client.predict_batch(input).await
    }
}
