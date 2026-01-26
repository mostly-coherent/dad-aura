/**
 * Simple in-memory rate limiter for API routes
 * Note: For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
};

/**
 * Get rate limit key from request
 */
function getRateLimitKey(request: Request): string {
  try {
    // Try to get IP from headers (works with Vercel, Cloudflare, etc.)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() || realIp?.trim() || 'unknown';
    
    // Include pathname to rate limit per endpoint
    const url = new URL(request.url);
    return `${ip}:${url.pathname}`;
  } catch (error) {
    // Fallback if URL parsing fails (edge runtime safety)
    console.error('Error getting rate limit key:', error);
    return 'unknown:unknown';
  }
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  try {
    const key = getRateLimitKey(request);
    const now = Date.now();
    
    // Clean up expired entries periodically (every 1000 requests)
    // Note: In Edge runtime, this in-memory store is per-instance
    // For production, consider using Redis or Vercel KV for shared state
    if (Math.random() < 0.001) {
      try {
        Object.keys(store).forEach((k) => {
          if (store[k] && store[k].resetTime < now) {
            delete store[k];
          }
        });
      } catch (cleanupError) {
        // Ignore cleanup errors - non-critical
        console.warn('Rate limit cleanup error (non-critical):', cleanupError);
      }
    }
  
    const entry = store[key];
    
    // No entry or expired
    if (!entry || entry.resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }
    
    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }
    
    // Increment count
    entry.count++;
    
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  } catch (error) {
    // On error, allow the request (fail open)
    // Better to allow a request than to block legitimate users
    console.error('Rate limit check error (failing open):', error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }
}

/**
 * Rate limit middleware result type
 */
export type RateLimitResult = 
  | { error: true; status: 429; message: string; resetTime: number }
  | { error: false; remaining: number; resetTime: number };

/**
 * Create rate limit middleware for API routes
 */
export function createRateLimitMiddleware(config?: Partial<RateLimitConfig>) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return (request: Request): RateLimitResult => {
    const result = checkRateLimit(request, finalConfig);
    
    if (!result.allowed) {
      return {
        error: true,
        status: 429,
        message: 'Too many requests. Please try again later.',
        resetTime: result.resetTime,
      };
    }
    
    return {
      error: false,
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  };
}

