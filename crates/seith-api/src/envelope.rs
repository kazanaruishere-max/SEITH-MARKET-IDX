use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ApiError {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Pagination {
    pub page: u32,
    #[serde(rename = "pageSize")]
    pub page_size: u32,
    pub total: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Envelope<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<ApiError>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pagination: Option<Pagination>,
}

impl<T> Envelope<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            pagination: None,
        }
    }

    pub fn ok_with_pagination(data: T, pagination: Pagination) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            pagination: Some(pagination),
        }
    }

    pub fn err(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(ApiError {
                code: code.into(),
                message: message.into(),
            }),
            pagination: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;

    #[test]
    fn ok_success_true() {
        let env = Envelope::ok(42u32);
        assert!(env.success);
        assert_eq!(env.data, Some(42));
        assert!(env.error.is_none());
        let s = serde_json::to_string(&env).unwrap();
        let v: Value = serde_json::from_str(&s).unwrap();
        assert_eq!(v["success"], true);
        assert_eq!(v["data"], 42);
    }

    #[test]
    fn err_validation_error() {
        let env: Envelope<()> = Envelope::err("VALIDATION_ERROR", "invalid market");
        assert!(!env.success);
        assert!(env.data.is_none());
        let e = env.error.unwrap();
        assert_eq!(e.code, "VALIDATION_ERROR");
        let s = serde_json::to_string(&Envelope::<()>::err("VALIDATION_ERROR", "x")).unwrap();
        let v: Value = serde_json::from_str(&s).unwrap();
        assert_eq!(v["success"], false);
        assert_eq!(v["error"]["code"], "VALIDATION_ERROR");
    }

    #[test]
    fn round_trip_ok() {
        let env = Envelope::ok("hello".to_string());
        let s = serde_json::to_string(&env).unwrap();
        let d: Envelope<String> = serde_json::from_str(&s).unwrap();
        assert_eq!(d, env);
    }

    #[test]
    fn round_trip_err() {
        let env: Envelope<Value> = Envelope::err("VALIDATION_ERROR", "bad");
        let s = serde_json::to_string(&env).unwrap();
        let d: Envelope<Value> = serde_json::from_str(&s).unwrap();
        assert_eq!(d, env);
    }

    #[test]
    fn pagination_round_trip() {
        let p = Pagination {
            page: 1,
            page_size: 20,
            total: 100,
        };
        let env = Envelope::ok_with_pagination(vec![1, 2, 3], p.clone());
        let s = serde_json::to_string(&env).unwrap();
        let d: Envelope<Vec<i32>> = serde_json::from_str(&s).unwrap();
        assert_eq!(d.pagination, Some(p));
        assert!(d.success);
    }
}
