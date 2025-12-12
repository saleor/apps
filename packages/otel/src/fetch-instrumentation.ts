/* eslint-disable turbo/no-undeclared-env-vars */
/**
 * Fetch instrumentation for tail sampling support.
 *
 * SOURCE: @vercel/otel v1.10.1 (commit a4a8662)
 * REPO: https://github.com/vercel/otel
 *
 * WHY THIS FILE EXISTS:
 * @vercel/otel's FetchInstrumentation has a hardcoded check that skips recording
 * for non-sampled spans. For tail sampling to work, we need to record span data
 * (including errors) even when the span wasn't initially sampled, so that
 * TailSamplingProcessor can decide to promote error spans at span end.
 *
 * MODIFICATIONS (search for "SALEOR MODIFICATION"):
 * 1. Renamed class to TailSamplingFetchInstrumentation
 * 2. Line ~291: Removed isSampled() check from early return
 * 3. Line ~296: Added isSampled() check to shouldPropagate condition
 * 4. Inlined utility functions at bottom (isSampled, resolveTemplate, getVercelRequestContext)
 *
 * We evaluated wrapper/proxy and monkey-patching approaches but they don't work:
 *
 * | Approach              | Why it doesn't work                                         |
 * |-----------------------|-------------------------------------------------------------|
 * | Wrapper pattern       | Span lifecycle is inside closure - can't intercept          |
 * | Monkey-patch isSampled| It's an imported module binding - can't patch after import  |
 * | Proxy TracerProvider  | Would enable propagation for ALL spans (we want selective)  |
 * | SpanProcessor post-fix| Span ends with NO attributes when non-sampled               |
 *
 * The fundamental issue: we need recording=YES for all spans (tail sampling)
 * but propagation=ONLY for truly sampled spans. The original code ties both
 * behaviors to the same isSampled() check, requiring code modification.
 *
 * ## What's copied from @vercel/otel
 *
 * Code is copied from @vercel/otel v1.10.1 FetchInstrumentation.enable().
 * Source: https://github.com/vercel/otel/blob/v1.10.1/packages/otel/src/instrumentations/fetch.ts
 *
 * Some comments to disable eslint errors were added.
 * Actual code modifications are marked with "SALEOR MODIFICATION START/END" comments.
 * WHEN TO UPDATE:
 * If @vercel/otel updates FetchInstrumentation, copy the new file and re-apply modifications.
 */
import type { Attributes, Span, TextMapSetter, TracerProvider } from "@opentelemetry/api";
import {
  context,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace as traceApi,
  TraceFlags,
} from "@opentelemetry/api";
import type { Instrumentation, InstrumentationConfig } from "@opentelemetry/instrumentation";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";

/**
 * Configuration for the "fetch" instrumentation.
 *
 * Some of this configuration can be overriden on a per-fetch call basis by
 * using the `opentelemetry` property in the `RequestInit` object (requires Next 14.1.1 or above).
 * This property can include:
 * - `ignore`: boolean - whether to ignore the fetch call from tracing. Overrides
 *   `ignoreUrls`.
 * - `propagateContext: boolean`: overrides `propagateContextUrls` for this call.
 * - `spanName: string`: overrides the computed span name for this call.
 * - `attributes: Attributes`: overrides the computed attributes for this call.
 */
export interface FetchInstrumentationConfig extends InstrumentationConfig {
  /**
   * A set of URL matchers (string prefix or regex) that should be ignored from tracing.
   * By default all URLs are traced.
   * Can be overriden by the `opentelemetry.ignore` property in the `RequestInit` object.
   *
   * Example: `fetch: { ignoreUrls: [/example.com/] }`.
   */
  ignoreUrls?: (string | RegExp)[];

  /**
   * A set of URL matchers (string prefix or regex) for which the tracing context
   * should be propagated (see [`propagators`](Configuration#propagators)).
   * By default the context is propagated _only_ for the
   * [deployment URLs](https://vercel.com/docs/deployments/generated-urls), all
   * other URLs should be enabled explicitly.
   * Can be overriden by the `opentelemetry.propagateContext` property in the `RequestInit` object.
   *
   * Example: `fetch: { propagateContextUrls: [ /my.api/ ] }`.
   */
  propagateContextUrls?: (string | RegExp)[];

  /**
   * A set of URL matchers (string prefix or regex) for which the tracing context
   * should not be propagated (see [`propagators`](Configuration#propagators)). This allows you to exclude a
   * subset of URLs allowed by the [`propagateContextUrls`](FetchInstrumentationConfig#propagateContextUrls).
   * Can be overriden by the `opentelemetry.propagateContext` property in the `RequestInit` object.
   */
  dontPropagateContextUrls?: (string | RegExp)[];

  /**
   * A string for the "resource.name" attribute that can include attribute expressions in `{}`.
   * Can be overriden by the `opentelemetry.attributes` property in the `RequestInit` object.
   *
   * Example: `fetch: { resourceNameTemplate: "{http.host}" }`.
   */
  resourceNameTemplate?: string;

  /**
   * A map of attributes that should be created from the request headers. The keys of the map are
   * attribute names and the values are request header names. If a resonse header doesn't exist, no
   * attribute will be created for it.
   *
   * Example: `fetch: { attributesFromRequestHeaders: { "attr1": "X-Attr" } }`
   */
  attributesFromRequestHeaders?: Record<string, string>;

  /**
   * A map of attributes that should be created from the response headers. The keys of the map are
   * attribute names and the values are response header names. If a resonse header doesn't exist, no
   * attribute will be created for it.
   *
   * Example: `fetch: { attributesFromResponseHeaders: { "attr1": "X-Attr" } }`
   */
  attributesFromResponseHeaders?: Record<string, string>;
}

declare global {
  interface RequestInit {
    opentelemetry?: {
      ignore?: boolean;
      propagateContext?: boolean;
      spanName?: string;
      attributes?: Attributes;
    };
  }
}

type InternalRequestInit = RequestInit & {
  next?: {
    internal: boolean;
  };
};

// SALEOR MODIFICATION: Renamed class from FetchInstrumentation
export class TailSamplingFetchInstrumentation implements Instrumentation {
  instrumentationName = "@saleor/otel/fetch";
  instrumentationVersion = "1.0.0";
  /** @internal */
  private config: FetchInstrumentationConfig;
  /** @internal */
  private originalFetch: typeof fetch | undefined;
  /** @internal */
  private tracerProvider: TracerProvider | undefined;

  constructor(config: FetchInstrumentationConfig = {}) {
    this.config = config;
  }

  getConfig(): FetchInstrumentationConfig {
    return this.config;
  }

  setConfig(): void {
    // Nothing.
  }

  setTracerProvider(tracerProvider: TracerProvider): void {
    this.tracerProvider = tracerProvider;
  }

  setMeterProvider(): void {
    // Nothing.
  }

  public enable(): void {
    this.disable();

    const { tracerProvider } = this;

    if (!tracerProvider) {
      return;
    }

    const tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);

    const ignoreUrls = this.config.ignoreUrls ?? [];

    const shouldIgnore = (url: URL, init: InternalRequestInit | undefined): boolean => {
      if (init?.opentelemetry?.ignore !== undefined) {
        return init.opentelemetry.ignore;
      }
      if (ignoreUrls.length === 0) {
        return false;
      }
      const urlString = url.toString();

      return ignoreUrls.some((match) => {
        if (typeof match === "string") {
          if (match === "*") {
            return true;
          }

          return urlString.startsWith(match);
        }

        return match.test(urlString);
      });
    };

    const host = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || null;
    const branchHost =
      process.env.VERCEL_BRANCH_URL || process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || null;
    const propagateContextUrls = this.config.propagateContextUrls ?? [];
    const dontPropagateContextUrls = this.config.dontPropagateContextUrls ?? [];
    const resourceNameTemplate = this.config.resourceNameTemplate;
    const { attributesFromRequestHeaders, attributesFromResponseHeaders } = this.config;

    const shouldPropagate = (url: URL, init: InternalRequestInit | undefined): boolean => {
      if (init?.opentelemetry?.propagateContext) {
        return init.opentelemetry.propagateContext;
      }
      const urlString = url.toString();

      if (
        dontPropagateContextUrls.length > 0 &&
        dontPropagateContextUrls.some((match) => {
          if (typeof match === "string") {
            if (match === "*") {
              return true;
            }

            return urlString.startsWith(match);
          }

          return match.test(urlString);
        })
      ) {
        return false;
      }
      // Allow same origin.
      if (
        host &&
        url.protocol === "https:" &&
        (url.host === host ||
          url.host === branchHost ||
          url.host === getVercelRequestContext()?.headers.host)
      ) {
        return true;
      }
      // Allow localhost for testing in a dev mode.
      if (!host && url.protocol === "http:" && url.hostname === "localhost") {
        return true;
      }

      return propagateContextUrls.some((match) => {
        if (typeof match === "string") {
          if (match === "*") {
            return true;
          }

          return urlString.startsWith(match);
        }

        return match.test(urlString);
      });
    };

    // Disable fetch tracing in Next.js.
    process.env.NEXT_OTEL_FETCH_DISABLED = "1";

    const originalFetch = globalThis.fetch;

    this.originalFetch = originalFetch;

    const doFetch: typeof fetch = async (input, initArg) => {
      const init = initArg as InternalRequestInit | undefined;

      // Passthrough internal requests.
      if (init?.next?.internal) {
        return originalFetch(input, init);
      }

      const req = new Request(
        /*
         * The input Request must be cloned to avoid the bug
         * on Edge runtime where the `new Request()` eagerly
         * consumes the body of the original Request.
         */
        input instanceof Request ? input.clone() : input,
        init,
      );
      const url = new URL(req.url);

      if (shouldIgnore(url, init)) {
        return originalFetch(input, init);
      }

      const attrs = {
        [SemanticAttributes.HTTP_METHOD]: req.method,
        [SemanticAttributes.HTTP_URL]: req.url,
        [SemanticAttributes.HTTP_HOST]: url.host,
        [SemanticAttributes.HTTP_SCHEME]: url.protocol.replace(":", ""),
        [SemanticAttributes.NET_PEER_NAME]: url.hostname,
        [SemanticAttributes.NET_PEER_PORT]: url.port,
      };
      const resourceName = resourceNameTemplate
        ? resolveTemplate(resourceNameTemplate, attrs)
        : removeSearch(req.url);

      const spanName = init?.opentelemetry?.spanName ?? `fetch ${req.method} ${req.url}`;

      const parentContext = context.active();

      const span = tracer.startSpan(
        spanName,
        {
          kind: SpanKind.CLIENT,
          attributes: {
            ...attrs,
            "operation.name": `fetch.${req.method}`,
            "resource.name": resourceName,
            ...init?.opentelemetry?.attributes,
          },
        },
        parentContext,
      );

      /*
       * SALEOR MODIFICATION: Removed isSampled() check from this condition.
       * Original: if (!span.isRecording() || !isSampled(span.spanContext().traceFlags))
       * This allows non-sampled spans to continue recording for tail sampling.
       */
      if (!span.isRecording()) {
        span.end();

        return originalFetch(input, init);
      }

      /*
       * SALEOR MODIFICATION: Added isSampled() check to propagation condition.
       * Original: if (shouldPropagate(url, init))
       * Only propagate trace context for sampled spans, not deferred ones.
       */
      if (shouldPropagate(url, init) && isSampled(span.spanContext().traceFlags)) {
        const fetchContext = traceApi.setSpan(parentContext, span);

        propagation.inject(fetchContext, req.headers, HEADERS_SETTER);
      }

      if (attributesFromRequestHeaders) {
        headersToAttributes(span, attributesFromRequestHeaders, req.headers);
      }

      try {
        const startTime = Date.now();

        /*
         * Remove "content-type" for a FormData body because undici regenerates
         * a new multipart separator each time.
         */
        if (init?.body && init.body instanceof FormData) {
          req.headers.delete("content-type");
        }
        const res = await originalFetch(input, {
          ...init,
          headers: req.headers,
        });
        const duration = Date.now() - startTime;

        span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, res.status);
        span.setAttribute("http.response_time", duration);
        if (attributesFromResponseHeaders) {
          headersToAttributes(span, attributesFromResponseHeaders, res.headers);
        }
        if (res.status >= 500) {
          onError(span, `Status: ${res.status} (${res.statusText})`);
        }

        // Flush body, but non-blocking.
        if (res.body) {
          void pipeResponse(res).then(
            (byteLength) => {
              if (span.isRecording()) {
                span.setAttribute(
                  SemanticAttributes.HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
                  byteLength,
                );
                span.end();
              }
            },
            (err) => {
              if (span.isRecording()) {
                onError(span, err);
                span.end();
              }
            },
          );
        } else {
          span.end();
        }

        return res;
      } catch (e) {
        onError(span, e);
        span.end();
        throw e;
      }
    };

    globalThis.fetch = doFetch;
  }

  public disable(): void {
    if (this.originalFetch) {
      globalThis.fetch = this.originalFetch;
    }
  }
}

const HEADERS_SETTER: TextMapSetter<Headers> = {
  set(carrier: Headers, key: string, value: string): void {
    carrier.set(key, value);
  },
};

function removeSearch(url: string): string {
  const index = url.indexOf("?");

  return index === -1 ? url : url.substring(0, index);
}

function pipeResponse(res: Response): Promise<number> {
  let length = 0;
  const clone = res.clone();
  const reader = clone.body?.getReader();

  if (!reader) {
    return Promise.resolve(0);
  }
  const read = (): Promise<void> => {
    return reader.read().then(({ done, value }) => {
      if (done) {
        return;
      }
      length += value.byteLength;

      return read();
    });
  };

  return read().then(() => length);
}

function onError(span: Span, err: unknown): void {
  if (err instanceof Error) {
    span.recordException(err);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: err.message,
    });
  } else {
    const message = String(err);

    span.setStatus({
      code: SpanStatusCode.ERROR,
      message,
    });
  }
}

function headersToAttributes(
  span: Span,
  attrsToHeadersMap: Record<string, string>,
  headers: Headers,
): void {
  for (const [attrName, headerName] of Object.entries(attrsToHeadersMap)) {
    const headerValue = headers.get(headerName);

    if (headerValue !== null) {
      span.setAttribute(attrName, headerValue);
    }
  }
}

/*
 * =============================================================================
 * SALEOR MODIFICATION: Inlined utilities from @vercel/otel internal modules
 * =============================================================================
 */

// From @vercel/otel v1.10.1 util/sampled.ts
function isSampled(traceFlags: number): boolean {
  return (traceFlags & TraceFlags.SAMPLED) !== 0;
}

// From @vercel/otel v1.10.1 util/template.ts
function resolveTemplate(template: string, attrs: Attributes): string {
  return template.replace(/\{(?<temp1>[^{}]+)\}/g, (match, key) => {
    const value = attrs[key as string];

    if (value !== undefined) {
      return String(value);
    }

    return match;
  });
}

// From @vercel/otel v1.10.1 vercel-request-context/api.ts
interface VercelRequestContext {
  waitUntil: (promiseOrFunc: Promise<unknown> | (() => Promise<unknown>)) => void;
  headers: Record<string, string | undefined>;
  url: string;
  [key: symbol]: unknown;
}

interface Reader {
  get: () => VercelRequestContext | undefined;
}

const symbol = Symbol.for("@vercel/request-context");

interface GlobalWithReader {
  [symbol]?: Reader;
}

function getVercelRequestContext(): VercelRequestContext | undefined {
  const reader = (globalThis as GlobalWithReader)[symbol];

  return reader?.get();
}
