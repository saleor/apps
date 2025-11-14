import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";
import { createLogger } from "@/lib/logger";

const logger = createLogger("PayPalConfigCache");

/**
 * Cache key type: saleorApiUrl + channelId
 */
type CacheKey = string;

interface CacheEntry {
  config: PayPalConfig | null;
  timestamp: number;
}

/**
 * In-memory cache for PayPal channel configurations
 * Reduces Saleor GraphQL metadata queries for frequently accessed configs
 */
class PayPalConfigCache {
  private cache: Map<CacheKey, CacheEntry> = new Map();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  /**
   * Generate cache key from saleorApiUrl and optional channelId
   */
  private getCacheKey(saleorApiUrl: string, channelId?: string): CacheKey {
    return channelId ? `${saleorApiUrl}:${channelId}` : saleorApiUrl;
  }

  /**
   * Get cached config if valid, otherwise return undefined
   */
  get(saleorApiUrl: string, channelId?: string): PayPalConfig | null | undefined {
    const key = this.getCacheKey(saleorApiUrl, channelId);
    const entry = this.cache.get(key);

    if (!entry) {
      logger.debug("Cache miss: no cached config for key", { key });
      return undefined;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > this.TTL_MS) {
      logger.debug("Cache miss: config expired", {
        key,
        age_ms: age,
        ttl_ms: this.TTL_MS,
      });
      this.cache.delete(key);
      return undefined;
    }

    logger.debug("Cache hit: returning cached config", {
      key,
      age_ms: age,
      ttl_ms: this.TTL_MS,
      has_config: !!entry.config,
    });
    return entry.config;
  }

  /**
   * Set config in cache
   */
  set(saleorApiUrl: string, config: PayPalConfig | null, channelId?: string): void {
    const key = this.getCacheKey(saleorApiUrl, channelId);
    this.cache.set(key, {
      config,
      timestamp: Date.now(),
    });

    logger.debug("Config cached", {
      key,
      has_config: !!config,
      cache_size: this.cache.size,
    });
  }

  /**
   * Invalidate cache for specific saleorApiUrl and channelId
   */
  invalidate(saleorApiUrl: string, channelId?: string): void {
    const key = this.getCacheKey(saleorApiUrl, channelId);
    const deleted = this.cache.delete(key);

    logger.debug("Cache invalidated", {
      key,
      was_cached: deleted,
    });
  }

  /**
   * Invalidate all cache entries for a saleorApiUrl (all channels)
   */
  invalidateAll(saleorApiUrl: string): void {
    let deletedCount = 0;

    for (const key of this.cache.keys()) {
      if (key.startsWith(saleorApiUrl)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    logger.debug("All cache entries invalidated for saleorApiUrl", {
      saleor_api_url: saleorApiUrl,
      deleted_count: deletedCount,
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();

    logger.debug("All cache cleared", {
      cleared_entries: size,
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    cacheSize: number;
    entries: Array<{ key: string; age: number; hasConfig: boolean }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      hasConfig: !!entry.config,
    }));

    return {
      cacheSize: this.cache.size,
      entries,
    };
  }
}

// Singleton instance
export const paypalConfigCache = new PayPalConfigCache();
