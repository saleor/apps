import { GlobalPayPalConfig } from "./global-paypal-config";
import { createLogger } from "@/lib/logger";

const logger = createLogger("GlobalPayPalConfigCache");

/**
 * In-memory cache for global PayPal configuration
 * Reduces database queries for frequently accessed config
 */
class GlobalPayPalConfigCache {
  private cache: GlobalPayPalConfig | null = null;
  private cacheTimestamp: number | null = null;
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  /**
   * Get cached config if valid, otherwise return null
   */
  get(): GlobalPayPalConfig | null {
    if (!this.cache || !this.cacheTimestamp) {
      logger.debug("Cache miss: no cached config");
      return null;
    }

    const now = Date.now();
    const age = now - this.cacheTimestamp;

    if (age > this.TTL_MS) {
      logger.debug("Cache miss: config expired", {
        age_ms: age,
        ttl_ms: this.TTL_MS,
      });
      this.invalidate();
      return null;
    }

    logger.debug("Cache hit: returning cached config", {
      age_ms: age,
      ttl_ms: this.TTL_MS,
    });
    return this.cache;
  }

  /**
   * Set config in cache
   */
  set(config: GlobalPayPalConfig | null): void {
    this.cache = config;
    this.cacheTimestamp = Date.now();

    logger.debug("Config cached", {
      has_config: !!config,
      cached_at: this.cacheTimestamp,
    });
  }

  /**
   * Invalidate the cache
   */
  invalidate(): void {
    logger.debug("Cache invalidated");
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    hasCachedConfig: boolean;
    cacheAge: number | null;
    ttl: number;
  } {
    const age = this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null;
    return {
      hasCachedConfig: !!this.cache,
      cacheAge: age,
      ttl: this.TTL_MS,
    };
  }
}

// Singleton instance
export const globalPayPalConfigCache = new GlobalPayPalConfigCache();
