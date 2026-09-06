use std::ops::Deref;

#[derive(Clone)]
pub struct Redacted(pub String);

impl Deref for Redacted {
    type Target = String;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl std::fmt::Debug for Redacted {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "***")
    }
}

impl std::fmt::Display for Redacted {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "***")
    }
}

pub fn redact(s: &str) -> String {
    if s.len() <= 4 {
        "***".to_string()
    } else {
        format!("{}***{}", &s[..2], &s[s.len() - 2..])
    }
}

pub fn sanitize_error(msg: &str) -> String {
    let mut out = msg.to_string();
    for key in ["SECTORS_API_KEY", "LLM_BASE_URL"] {
        if let Some(start) = out.find(key) {
            let end = out[start..]
                .find('\n')
                .map(|i| start + i)
                .unwrap_or(out.len());
            out.replace_range(start..end, &format!("{key}=***"));
        }
    }
    out
}
