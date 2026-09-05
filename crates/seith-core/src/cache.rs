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

pub struct SqliteCache {
    pub path: String,
}

pub struct CompositeCache<K, V>
where
    K: Hash + Eq + Send + Sync + 'static,
    V: Clone + Send + Sync + 'static,
{
    pub l1: MokaCache<K, V>,
    pub l2: SqliteCache,
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
