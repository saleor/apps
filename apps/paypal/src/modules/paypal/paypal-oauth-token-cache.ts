import { createLogger } from "@/lib/logger";
import { PayPalEnv } from "./paypal-env";

const logger = createLogger("PayPalOAuthTokenCache");

/**
 * Cache key: clientId + environment
 */
type CacheKey = string;

interface TokenCacheEntry {
  accessToken: string;
  expiresAt: number; // Timestamp when token expires
}

/**
 * Global singleton cache for PayPal OAuth tokens
 * Ensures tokens are reused across PayPalClient instances
 */
class PayPalOAuthTokenCache {
  private cache: Map<CacheKey, TokenCacheEntry> = new Map();

  /**
   * Generate cache key from clientId and environment
   */
  private getCacheKey(clientId: string, env: PayPalEnv): CacheKey {
    return `${clientId}:${env}`;
  }

  /**
   * Get cached token if valid, otherwise return null
   */
  get(clientId: string, env: PayPalEnv): string | null {
    const key = this.getCacheKey(clientId, env);
    const entry = this.cache.get(key);

    if (!entry) {
      logger.debug("Token cache miss: no cached token", {
        client_id_prefix: clientId.substring(0, 8),
        env,
      });
      return null;
    }

    const now = Date.now();
    if (now >= entry.expiresAt) {
      logger.debug("Token cache miss: token expired", {
        client_id_prefix: clientId.substring(0, 8),
        env,
        expired_at: new Date(entry.expiresAt).toISOString(),
      });
      this.cache.delete(key);
      return null;
    }

    const ttl = entry.expiresAt - now;
    logger.debug("Token cache hit: returning cached token", {
      client_id_prefix: clientId.substring(0, 8),
      env,
      ttl_seconds: Math.floor(ttl / 1000),
    });

    return entry.accessToken;
  }

  /**
   * Set token in cache with expiry time
   * @param clientId PayPal client ID
   * @param env PayPal environment (SANDBOX or LIVE)
   * @param accessToken The OAuth access token
   * @param expiresInSeconds Token lifetime in seconds (from PayPal response)
   */
  set(
    clientId: string,
    env: PayPalEnv,
    accessToken: string,
    expiresInSeconds: number
  ): void {
    const key = this.getCacheKey(clientId, env);

    // Refresh token 60 seconds before actual expiry for safety margin
    const safetyMarginSeconds = 60;
    const effectiveExpiresIn = Math.max(0, expiresInSeconds - safetyMarginSeconds);
    const expiresAt = Date.now() + effectiveExpiresIn * 1000;

    this.cache.set(key, {
      accessToken,
      expiresAt,
    });

    logger.info("OAuth token cached", {
      client_id_prefix: clientId.substring(0, 8),
      env,
      expires_in_seconds: expiresInSeconds,
      effective_ttl_seconds: effectiveExpiresIn,
      expires_at: new Date(expiresAt).toISOString(),
    });
  }

  /**
   * Invalidate cached token for specific clientId and environment
   */
  invalidate(clientId: string, env: PayPalEnv): void {
    const key = this.getCacheKey(clientId, env);
    const deleted = this.cache.delete(key);

    logger.debug("Token cache invalidated", {
      client_id_prefix: clientId.substring(0, 8),
      env,
      was_cached: deleted,
    });
  }

  /**
   * Clear all cached tokens
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();

    logger.debug("All token cache cleared", {
      cleared_entries: size,
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    cacheSize: number;
    entries: Array<{ key: string; ttl: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key: key.replace(/:[^:]+$/, ":***"), // Mask client ID for security
      ttl: Math.max(0, entry.expiresAt - now),
    }));

    return {
      cacheSize: this.cache.size,
      entries,
    };
  }
}

// Global singleton instance
export const paypalOAuthTokenCache = new PayPalOAuthTokenCache();
