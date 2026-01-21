import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function getRedisClient(): Redis {
  if (globalForRedis.redis) {
    return globalForRedis.redis;
  }

  const redis = new Redis(process.env.redis_v1_REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // Connection pool settings
    enableReadyCheck: false,
    connectTimeout: 5000,
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  redis.on('connect', () => {
    console.log('Redis connected');
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
  }

  return redis;
}

export const redis = getRedisClient();

// Cache key prefixes
const CACHE_KEYS = {
  dashboardStats: (userId: string, isAdmin: boolean) => `dashboard:stats:${isAdmin ? 'admin' : userId}`,
  partnerDashboard: (partnerId: string) => `partner:dashboard:${partnerId}`,
  leadDetail: (leadId: string) => `lead:${leadId}`,
  partnerLeads: (partnerId: string) => `partner:leads:${partnerId}`,
} as const;

// Cache TTL in seconds
const CACHE_TTL = {
  dashboardStats: 30, // 30 seconds - stats refresh quickly
  partnerDashboard: 60, // 1 minute
  leadDetail: 120, // 2 minutes
  partnerLeads: 60, // 1 minute
} as const;

// Cache utilities
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const data = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, data);
      } else {
        await redis.set(key, data);
      }
    } catch (err) {
      console.error('Redis set error:', err);
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      console.error('Redis delPattern error:', err);
    }
  },

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1;
  },

  async incr(key: string): Promise<number> {
    return await redis.incr(key);
  },

  async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  },

  // Rate limiting
  async rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  },

  // Cached fetch with stale-while-revalidate pattern
  async getOrFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttlSeconds: number
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache (non-blocking)
    this.set(key, data, ttlSeconds).catch(() => {});
    
    return data;
  },

  // Invalidation helpers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  invalidateDashboard: async (_userId?: string) => {
    await cache.delPattern('dashboard:stats:*');
  },

  invalidatePartner: async (partnerId: string) => {
    await cache.del(CACHE_KEYS.partnerDashboard(partnerId));
    await cache.del(CACHE_KEYS.partnerLeads(partnerId));
  },

  invalidateLead: async (leadId: string, partnerId?: string) => {
    await cache.del(CACHE_KEYS.leadDetail(leadId));
    if (partnerId) {
      await cache.invalidatePartner(partnerId);
    }
    await cache.invalidateDashboard();
  },

  // Expose keys and TTL for use in pages
  keys: CACHE_KEYS,
  ttl: CACHE_TTL,
};
