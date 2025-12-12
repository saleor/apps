/**
 * DataDog resource attributes extracted from @vercel/otel.
 *
 * SOURCE: @vercel/otel v1.10.1 (commit a4a8662)
 * REPO: https://github.com/vercel/otel
 *
 * WHY THIS FILE EXISTS:
 * @vercel/otel's CompositeSpanProcessor adds DataDog-specific attributes
 * (`operation.name`, `resource.name`) in onEnd() - but ONLY for sampled spans.
 *
 * When using tail sampling, spans start as non-sampled (RECORD decision) and
 * get promoted to SAMPLED by TailSamplingProcessor. The problem is:
 *
 * 1. Span ends → CompositeSpanProcessor.onEnd() runs first
 * 2. CompositeSpanProcessor checks isSampled() → false → skips resource attributes
 * 3. TailSamplingProcessor.onEnd() runs → promotes span to SAMPLED
 * 4. Promoted span goes to BatchSpanProcessor (never back through CompositeSpanProcessor)
 *
 * Result: promoted spans are missing DataDog attributes that normally sampled spans have.
 *
 * WHY CompositeSpanProcessor RUNS FIRST
 *
 * registerOTel() from @vercel/otel wraps our spanProcessors inside CompositeSpanProcessor:
 *
 * ```
 * tracerProvider.addSpanProcessor(
 *   new CompositeSpanProcessor(spanProcessors, ...)  // Our processors nested inside
 * )
 * ```
 *
 * This creates the processor chain:
 *   SDK → CompositeSpanProcessor → TailSamplingProcessor → BatchSpanProcessor
 * SOLUTION:
 * We extract getResourceAttributes() and its dependencies from @vercel/otel so that
 * TailSamplingProcessor can add these attributes when promoting spans.
 *
 * MODIFICATIONS:
 * - Removed CompositeSpanProcessor class (not needed)
 * - Kept only getResourceAttributes(), toOperationName(), and SPAN_KIND_NAME
 * - Renamed getResourceAttributes to computeVercelResourceAttributes and exported it
 *
 * WHEN TO UPDATE:
 * If @vercel/otel changes getResourceAttributes() logic, copy new file and re-apply modifications.
 */
import type { Attributes } from "@opentelemetry/api";
import { SpanKind } from "@opentelemetry/api";
import type { ReadableSpan } from "@opentelemetry/sdk-trace-node";

const SPAN_KIND_NAME: { [key in SpanKind]: string } = {
  [SpanKind.INTERNAL]: "internal",
  [SpanKind.SERVER]: "server",
  [SpanKind.CLIENT]: "client",
  [SpanKind.PRODUCER]: "producer",
  [SpanKind.CONSUMER]: "consumer",
};

// SALEOR MODIFICATION: Renamed from getResourceAttributes and exported
export function computeVercelResourceAttributes(span: ReadableSpan): Attributes | undefined {
  const { kind, attributes } = span;
  const {
    "operation.name": operationName,
    "resource.name": resourceName,
    "span.type": spanTypeAttr,
    "next.span_type": nextSpanType,
    "http.method": httpMethod,
    "http.route": httpRoute,
  } = attributes;

  if (operationName) {
    return undefined;
  }

  const resourceNameResolved =
    resourceName ??
    (httpMethod && typeof httpMethod === "string" && httpRoute && typeof httpRoute === "string"
      ? `${httpMethod} ${httpRoute}`
      : httpRoute);

  if (
    span.kind === SpanKind.SERVER &&
    httpMethod &&
    httpRoute &&
    typeof httpMethod === "string" &&
    typeof httpRoute === "string"
  ) {
    return {
      "operation.name": "web.request",
      "resource.name": resourceNameResolved,
    };
  }

  /*
   * Per https://github.com/DataDog/datadog-agent/blob/main/pkg/config/config_template.yaml,
   * the default operation.name is "library name + span kind".
   */
  const libraryName = span.instrumentationLibrary.name;
  const spanType = nextSpanType ?? spanTypeAttr;

  if (spanType && typeof spanType === "string") {
    const nextOperationName = toOperationName(libraryName, spanType);

    if (httpRoute) {
      return {
        "operation.name": nextOperationName,
        "resource.name": resourceNameResolved,
      };
    }

    return { "operation.name": nextOperationName };
  }

  return {
    "operation.name": toOperationName(
      libraryName,
      // SALEOR MODIFICATION: Added type assertion for stricter TypeScript config
      kind === SpanKind.INTERNAL ? "" : SPAN_KIND_NAME[kind as SpanKind],
    ),
  };
}

function toOperationName(libraryName: string, name: string): string {
  if (!libraryName) {
    return name;
  }
  let cleanLibraryName = libraryName.replace(/[ @./]/g, "_");

  if (cleanLibraryName.startsWith("_")) {
    cleanLibraryName = cleanLibraryName.slice(1);
  }

  return name ? `${cleanLibraryName}.${name}` : cleanLibraryName;
}
