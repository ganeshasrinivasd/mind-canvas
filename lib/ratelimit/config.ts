// lib/ratelimit/config.ts
import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient } from './redis';

// Rate limit tiers
export const RATE_LIMITS = {
  GUEST: {
    limit: 3,
    window: '60 m', // 3 requests per hour
  },
  AUTHENTICATED: {
    limit: 20,
    window: '60 m', // 20 requests per hour
  },
} as const;

// Guest rate limiter (IP-based)
let guestRateLimiter: Ratelimit | null = null;

export function getGuestRateLimiter(): Ratelimit {
  if (!guestRateLimiter) {
    guestRateLimiter = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(RATE_LIMITS.GUEST.limit, RATE_LIMITS.GUEST.window),
      prefix: 'ratelimit:guest',
      analytics: true,
    });
  }
  return guestRateLimiter;
}

// Authenticated user rate limiter (user ID-based)
let authRateLimiter: Ratelimit | null = null;

export function getAuthRateLimiter(): Ratelimit {
  if (!authRateLimiter) {
    authRateLimiter = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(RATE_LIMITS.AUTHENTICATED.limit, RATE_LIMITS.AUTHENTICATED.window),
      prefix: 'ratelimit:auth',
      analytics: true,
    });
  }
  return authRateLimiter;
}

// Helper to get IP address from request headers
export function getClientIp(request: Request): string {
  // Try to get IP from common headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to localhost (development)
  return '127.0.0.1';
}

// Rate limit check with detailed response
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp in ms
  identifier: string;
}

export async function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean
): Promise<RateLimitResult> {
  const limiter = isAuthenticated ? getAuthRateLimiter() : getGuestRateLimiter();
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    identifier,
  };
}
