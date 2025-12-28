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

// Cache utilities
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as T;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, data);
    } else {
      await redis.set(key, data);
    }
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1;
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
};
