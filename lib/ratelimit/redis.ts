// lib/ratelimit/redis.ts
import { Redis } from '@upstash/redis';

// Lazy initialization - only create Redis client when needed
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        'Missing Upstash Redis credentials. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your environment variables.'
      );
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}
