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

#[derive(Debug, Clone)]
pub struct Redacted<T>(pub T);

impl<T: std::fmt::Display> std::fmt::Display for Redacted<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "***")
    }
}
