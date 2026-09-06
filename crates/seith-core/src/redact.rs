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
    let keys = [
        "SECTORS_API_KEY",
        "LLM_BASE_URL",
        "ANALYSIS_URL",
        "KRONOS_URL",
    ];
    let mut out = msg.to_string();
    for key in keys {
        out = out.replace(&format!("{key}="), &format!("{key}=***"));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sanitize_anonymizes_all_keys() {
        let msg = "SECTORS_API_KEY=abc LLM_BASE_URL=foo ANALYSIS_URL=bar KRONOS_URL=baz";
        let out = sanitize_error(msg);
        assert!(out.contains("SECTORS_API_KEY=***"), "got: {out}");
        assert!(out.contains("LLM_BASE_URL=***"), "got: {out}");
        assert!(out.contains("ANALYSIS_URL=***"), "got: {out}");
        assert!(out.contains("KRONOS_URL=***"), "got: {out}");
    }

    #[test]
    fn sanitize_passthrough_no_keys() {
        let msg = "upstream 502 status";
        assert_eq!(sanitize_error(msg), msg);
    }

    #[test]
    fn sanitize_passthrough_key_substring() {
        let msg = "ACME industries sector api";
        assert_eq!(sanitize_error(msg), msg);
    }
}
