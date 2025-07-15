class MemoryStorage {
  constructor() {
    this.data = new Map();
    this.sets = new Map();
  }

  async hSet(key, field, value) {
    if (!this.data.has(key)) {
      this.data.set(key, new Map());
    }
    
    if (typeof field === 'object') {
      Object.entries(field).forEach(([f, v]) => {
        this.data.get(key).set(f, v);
      });
    } else {
      this.data.get(key).set(field, value);
    }
  }

  async hGet(key, field) {
    const hash = this.data.get(key);
    return hash ? hash.get(field) : undefined;
  }

  async hGetAll(key) {
    const hash = this.data.get(key);
    if (!hash) return {};
    
    const result = {};
    for (const [field, value] of hash) {
      result[field] = value;
    }
    return result;
  }

  async exists(key) {
    return this.data.has(key) ? 1 : 0;
  }

  async sAdd(key, value) {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    this.sets.get(key).add(value);
  }

  async sMembers(key) {
    const set = this.sets.get(key);
    return set ? Array.from(set) : [];
  }

  async del(key) {
    this.data.delete(key);
    this.sets.delete(key);
  }

  async flushAll() {
    this.data.clear();
    this.sets.clear();
  }

  connect() {
    return Promise.resolve();
  }

  on(event, callback) {
    // Mock event handler
  }
}

module.exports = MemoryStorage;