/**
 * Fetch instrumentation for tail sampling support.
 *
 * ## Why this file exists
 *
 * @vercel/otel's FetchInstrumentation has a hardcoded check that skips recording
 * for non-sampled spans. For tail sampling to work, we need to record span data
 * (including errors) even when the span wasn't initially sampled, so that
 * TailSamplingProcessor can decide to promote error spans at span end.
 *
 * ## Why we copy-paste instead of using alternatives
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
 *
 * ## When to update
 *
 * If @vercel/otel updates their FetchInstrumentation, review their changes.
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
import {
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_URL,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
} from "@opentelemetry/semantic-conventions";
import { FetchInstrumentation, type FetchInstrumentationConfig } from "@vercel/otel";

export type { FetchInstrumentationConfig };

type InternalRequestInit = RequestInit & {
  next?: {
    internal: boolean;
  };
  opentelemetry?: {
    ignore?: boolean;
    propagateContext?: boolean;
    spanName?: string;
    attributes?: Attributes;
  };
};

const HEADERS_SETTER: TextMapSetter<Headers> = {
  set(carrier: Headers, key: string, value: string): void {
    carrier.set(key, value);
  },
};

function isSampled(traceFlags: number): boolean {
  return (traceFlags & TraceFlags.SAMPLED) !== 0;
}

function removeSearch(url: string): string {
  const index = url.indexOf("?");

  return index === -1 ? url : url.substring(0, index);
}

function resolveTemplate(template: string, attrs: Attributes): string {
  return template.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = attrs[key];

    return value !== undefined ? String(value) : "";
  });
}

async function pipeResponse(res: Response): Promise<number> {
  let length = 0;
  const clone = res.clone();
  const reader = clone.body?.getReader();

  if (!reader) {
    return 0;
  }

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    length += value.byteLength;
  }

  return length;
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

/**
 * Fetch instrumentation that supports tail sampling.
 *
 * Implementation of @vercel/otel's FetchInstrumentation but overrides enable() to
 * continue recording spans even when not sampled, allowing TailSamplingProcessor
 * to promote error spans at span end.
 */
export class TailSamplingFetchInstrumentation extends FetchInstrumentation {
  override instrumentationName = "@saleor/otel/fetch";

  private tailSamplingConfig: FetchInstrumentationConfig;
  private tailSamplingOriginalFetch: typeof fetch | undefined;
  private tailSamplingTracerProvider: TracerProvider | undefined;

  constructor(config: FetchInstrumentationConfig = {}) {
    super(config);
    this.tailSamplingConfig = config;
  }

  override setTracerProvider(tracerProvider: TracerProvider): void {
    super.setTracerProvider(tracerProvider);
    this.tailSamplingTracerProvider = tracerProvider;
  }

  override enable(): void {
    this.disable();

    const tracerProvider = this.tailSamplingTracerProvider;

    if (!tracerProvider) {
      return;
    }

    const tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);

    const config = this.tailSamplingConfig;
    const ignoreUrls = config.ignoreUrls ?? [];

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
      // eslint-disable-next-line turbo/no-undeclared-env-vars -- Vercel system env var
      process.env.VERCEL_BRANCH_URL || process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || null;
    const propagateContextUrls = config.propagateContextUrls ?? [];
    const dontPropagateContextUrls = config.dontPropagateContextUrls ?? [];
    const resourceNameTemplate = config.resourceNameTemplate;
    const { attributesFromRequestHeaders, attributesFromResponseHeaders } = config;

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
      if (host && url.protocol === "https:" && (url.host === host || url.host === branchHost)) {
        return true;
      }

      // Allow localhost for testing in dev mode.
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

    // Disable fetch tracing in Next.js to avoid double instrumentation.
    // eslint-disable-next-line turbo/no-undeclared-env-vars -- Next.js internal env var
    process.env.NEXT_OTEL_FETCH_DISABLED = "1";

    const originalFetch = globalThis.fetch;

    this.tailSamplingOriginalFetch = originalFetch;

    const doFetch: typeof fetch = async (input, initArg) => {
      const init = initArg as InternalRequestInit | undefined;

      // Passthrough internal Next.js requests.
      if (init?.next?.internal) {
        return originalFetch(input, init);
      }

      const req = new Request(input instanceof Request ? input.clone() : input, init);
      const url = new URL(req.url);

      if (shouldIgnore(url, init)) {
        return originalFetch(input, init);
      }

      const attrs = {
        [SEMATTRS_HTTP_METHOD]: req.method,
        [SEMATTRS_HTTP_URL]: req.url,
        [SEMATTRS_HTTP_HOST]: url.host,
        [SEMATTRS_HTTP_SCHEME]: url.protocol.replace(":", ""),
        [SEMATTRS_NET_PEER_NAME]: url.hostname,
        [SEMATTRS_NET_PEER_PORT]: url.port,
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
       * === SALEOR MODIFICATION START ===
       * Original @vercel/otel check was:
       *   if (!span.isRecording() || !isSampled(span.spanContext().traceFlags))
       *
       * We removed isSampled() check so non-sampled spans continue recording
       * for tail sampling to capture errors.
       * We also added isSampled() to shouldPropagate check below to avoid
       * propagating trace context for non-sampled spans.
       */
      if (!span.isRecording()) {
        span.end();

        return originalFetch(input, init);
      }

      if (shouldPropagate(url, init) && isSampled(span.spanContext().traceFlags)) {
        // === SALEOR MODIFICATION END ===
        const fetchContext = traceApi.setSpan(parentContext, span);

        propagation.inject(fetchContext, req.headers, HEADERS_SETTER);
      }

      if (attributesFromRequestHeaders) {
        headersToAttributes(span, attributesFromRequestHeaders, req.headers);
      }

      try {
        const startTime = Date.now();

        /*
         * Remove "content-type" for FormData body because undici regenerates
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

        span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, res.status);
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
                span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED, byteLength);
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

  override disable(): void {
    if (this.tailSamplingOriginalFetch) {
      globalThis.fetch = this.tailSamplingOriginalFetch;
    }
  }
}
