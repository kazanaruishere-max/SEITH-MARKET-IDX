use std::hash::Hash;

pub trait Cache<K, V>: Send + Sync {
    fn get(&self, key: &K) -> Option<V>;
    fn set(&self, key: K, value: V);
    fn invalidate(&self, key: &K);
}

pub struct MokaCache<K, V>(pub moka::sync::Cache<K, V>)
where
    K: Hash + Eq + Send + Sync + 'static,
    V: Clone + Send + Sync + 'static;

impl<K, V> MokaCache<K, V>
where
    K: Hash + Eq + Send + Sync + 'static,
    V: Clone + Send + Sync + 'static,
{
    pub fn new(max_capacity: u64) -> Self {
        Self(
            moka::sync::Cache::builder()
                .max_capacity(max_capacity)
                .build(),
        )
    }
}

impl<K, V> Cache<K, V> for MokaCache<K, V>
where
    K: Hash + Eq + Send + Sync + 'static,
    V: Clone + Send + Sync + 'static,
{
    fn get(&self, key: &K) -> Option<V> {
        self.0.get(key)
    }
    fn set(&self, key: K, value: V) {
        self.0.insert(key, value);
    }
    fn invalidate(&self, key: &K) {
        self.0.invalidate(key);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn moka_round_trip() {
        let c: MokaCache<String, String> = MokaCache::new(100);
        c.set("k".to_string(), "v".to_string());
        assert_eq!(c.get(&"k".to_string()), Some("v".to_string()));
    }

    #[test]
    fn moka_missing_none() {
        let c: MokaCache<String, String> = MokaCache::new(100);
        assert_eq!(c.get(&"nope".to_string()), None);
    }

    #[test]
    fn moka_invalidate() {
        let c: MokaCache<String, String> = MokaCache::new(100);
        c.set("k".to_string(), "v".to_string());
        c.invalidate(&"k".to_string());
        assert_eq!(c.get(&"k".to_string()), None);
    }
}
