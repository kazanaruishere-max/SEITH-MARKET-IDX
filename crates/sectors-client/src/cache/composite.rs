use seith_core::cache::{Cache, MokaCache};

use super::sqlite::SqliteCache;

pub struct CompositeCache {
    pub l1: MokaCache<String, String>,
    pub l2: SqliteCache,
}

impl CompositeCache {
    pub fn new(l1_capacity: u64, l2_path: impl Into<String>) -> Self {
        Self {
            l1: MokaCache::new(l1_capacity),
            l2: SqliteCache::new(l2_path),
        }
    }

    pub fn get(&self, key: &str) -> Option<String> {
        if let Some(v) = self.l1.get(&key.to_string()) {
            return Some(v);
        }
        if let Some(v) = self.l2.get(key) {
            self.l1.set(key.to_string(), v.clone());
            return Some(v);
        }
        None
    }

    pub fn set(&self, key: String, value: String) {
        self.l1.set(key.clone(), value.clone());
        self.l2.set(key, value);
    }

    pub fn invalidate(&self, key: &str) {
        self.l1.invalidate(&key.to_string());
        self.l2.invalidate(key);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn mem() -> CompositeCache {
        CompositeCache::new(100, ":memory:")
    }

    #[test]
    fn l1_hit_without_l2() {
        let c = mem();
        c.set("k".to_string(), "v".to_string());
        assert_eq!(c.get("k"), Some("v".to_string()));
    }

    #[test]
    fn l1_miss_l2_hit_promotes_to_l1() {
        let c = mem();
        c.l2.set("k".to_string(), "v".to_string());
        assert_eq!(c.l1.get(&"k".to_string()), None);
        assert_eq!(c.get("k"), Some("v".to_string()));
        assert_eq!(c.l1.get(&"k".to_string()), Some("v".to_string()));
    }

    #[test]
    fn id_vs_sg_isolated() {
        let c = mem();
        c.set(
            "id:FINANCE:BBCA:2026-09-06".to_string(),
            "id_val".to_string(),
        );
        c.set(
            "sg:FINANCE:DBS:2026-09-06".to_string(),
            "sg_val".to_string(),
        );
        assert_eq!(
            c.get("id:FINANCE:BBCA:2026-09-06"),
            Some("id_val".to_string())
        );
        assert_eq!(
            c.get("sg:FINANCE:DBS:2026-09-06"),
            Some("sg_val".to_string())
        );
        assert_ne!(
            c.get("id:FINANCE:BBCA:2026-09-06"),
            c.get("sg:FINANCE:DBS:2026-09-06")
        );
    }

    #[test]
    fn invalidate_clears_both() {
        let c = mem();
        c.set("k".to_string(), "v".to_string());
        c.invalidate("k");
        assert_eq!(c.get("k"), None);
        assert_eq!(c.l1.get(&"k".to_string()), None);
        assert_eq!(c.l2.get("k"), None);
    }
}
