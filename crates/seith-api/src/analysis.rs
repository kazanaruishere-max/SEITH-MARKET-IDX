use seith_core::analysis::{
    AnalysisClient, AnalysisError, AnalysisRepository, SynthesizeInput, SynthesizeOutput,
};

pub struct AnalysisService {
    client: AnalysisClient,
}

impl AnalysisService {
    pub fn new(base_url: impl Into<String>) -> Result<Self, AnalysisError> {
        Ok(Self {
            client: AnalysisClient::new(base_url)?,
        })
    }

    pub fn from_client(client: AnalysisClient) -> Self {
        Self { client }
    }
}

impl AnalysisRepository for AnalysisService {
    async fn synthesize(&self, input: SynthesizeInput) -> Result<SynthesizeOutput, AnalysisError> {
        self.client.synthesize(input).await
    }
}
