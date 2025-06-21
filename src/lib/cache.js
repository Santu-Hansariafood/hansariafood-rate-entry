// Simple in-memory cache for API responses
class Cache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new Cache();

// Cache wrapper for API calls
export const withCache = (key, fetcher, ttl) => {
  const cached = apiCache.get(key);
  if (cached) return Promise.resolve(cached);
  
  return fetcher().then(data => {
    apiCache.set(key, data);
    return data;
  });
};