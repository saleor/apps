/**
 * Fetch instrumentation for tail sampling support.
 *
 * Extends @vercel/otel FetchInstrumentation but overrides enable() to support
 * tail sampling by continuing to record spans even when not initially sampled.
 * This allows TailSamplingProcessor to promote error spans at span end.
 *
 * Key difference: Removed the early bailout check `!isSampled(traceFlags)`
 * so that error information is captured for non-sampled spans.
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
 * Extends @vercel/otel's FetchInstrumentation but overrides enable() to
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

  /**
   * Override enable() to remove the `!isSampled()` check.
   *
   * This is a copy of @vercel/otel's FetchInstrumentation.enable() with one key change:
   * The original check `if (!span.isRecording() || !isSampled(span.spanContext().traceFlags))`
   * is changed to just `if (!span.isRecording())` to support tail sampling.
   */
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
       * TAIL SAMPLING CHANGE: Only check isRecording(), NOT isSampled().
       *
       * Original @vercel/otel check was:
       *   if (!span.isRecording() || !isSampled(span.spanContext().traceFlags))
       *
       * This caused non-sampled spans to be ended early without error info.
       * For tail sampling, we need to continue recording so that errors
       * can be captured and the span can be promoted at end time.
       *
       * We still skip non-recording spans (NOT_RECORD sampling decision).
       */
      if (!span.isRecording()) {
        span.end();

        return originalFetch(input, init);
      }

      /*
       * Only propagate context if the span is actually sampled.
       * Non-sampled spans should not propagate trace context to avoid
       * forcing downstream services to sample.
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
