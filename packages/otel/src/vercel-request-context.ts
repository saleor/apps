/**
 * Vercel Request Context utilities extracted from @vercel/otel.
 *
 * SOURCE: @vercel/otel v1.10.1
 * REPO: https://github.com/vercel/otel
 *
 * WHY THIS FILE EXISTS:
 * When using tail sampling with trace buffering, promoted spans need to:
 * 1. Call waitUntil() to ensure they're flushed before the request ends
 * 2. Include Vercel request-context attributes (vercel.request_id, etc.)
 *
 * @vercel/otel's CompositeSpanProcessor handles this for sampled-at-start spans,
 * but promoted spans bypass that flow. We need direct access to these utilities.
 */

const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");

interface VercelRequestContext {
  waitUntil: (promiseOrFunc: Promise<unknown> | (() => Promise<unknown>)) => void;
  headers: Record<string, string | undefined>;
  url: string;
}

interface GlobalWithVercelRequestContext {
  [VERCEL_REQUEST_CONTEXT_SYMBOL]?: {
    get: () => VercelRequestContext | undefined;
  };
}

/**
 * Get the Vercel request context for the current request.
 * Returns undefined when not running in Vercel environment.
 */
export function getVercelRequestContext(): VercelRequestContext | undefined {
  const globalWithContext = globalThis as GlobalWithVercelRequestContext;
  const reader = globalWithContext[VERCEL_REQUEST_CONTEXT_SYMBOL];

  return reader?.get();
}

/**
 * Extract Vercel-specific attributes from the request context.
 * These attributes are normally added by @vercel/otel's CompositeSpanProcessor
 * for sampled spans, but promoted spans need them added explicitly.
 *
 * Based on @vercel/otel vercel-request-context/attributes.ts
 */
export function getVercelRequestContextAttributes(): Record<string, string> {
  const vrc = getVercelRequestContext();

  if (!vrc) {
    return {};
  }

  const attrs: Record<string, string> = {};

  // x-vercel-id contains the request ID
  const requestId = vrc.headers["x-vercel-id"];

  if (requestId) {
    attrs["vercel.request_id"] = requestId;
  }

  // x-matched-path contains the matched route
  const matchedPath = vrc.headers["x-matched-path"];

  if (matchedPath) {
    attrs["vercel.matched_path"] = matchedPath;
  }

  // Host header
  const host = vrc.headers["host"];

  if (host) {
    attrs["http.host"] = host;
  }

  // Edge region (for edge functions)
  const region = vrc.headers["x-vercel-edge-region"];

  if (region) {
    attrs["vercel.edge_region"] = region;
  }

  return attrs;
}
