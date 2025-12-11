/**
 * DataDog resource attributes for @vercel/otel compatibility.
 *
 * ## Why this file exists
 *
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
 * ## Why CompositeSpanProcessor runs first
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
 *
 * ## Solution
 *
 * We replicate @vercel/otel's getResourceAttributes() logic here so that
 * TailSamplingProcessor can add these attributes when promoting spans.
 *
 * Source: https://github.com/vercel/otel/blob/v1.10.1/packages/otel/src/processor/composite-span-processor.ts
 *
 * ## When to update
 *
 * If @vercel/otel changes their getResourceAttributes() logic, update this file.
 * Consider requesting upstream support for tail sampling to avoid this hack.
 */
import { SpanKind } from "@opentelemetry/api";
import { ReadableSpan } from "@opentelemetry/sdk-trace-node";

/**
 * Compute DataDog-compatible resource attributes for a span.
 * Mirrors logic from @vercel/otel CompositeSpanProcessor.getResourceAttributes()
 */
export function computeVercelResourceAttributes(span: ReadableSpan): Record<string, string> {
  const { kind, attributes } = span;

  /*
   * Skip if operation.name already exists - it was intentionally set by
   * instrumentation or user code. We should not override intentional values.
   */
  if (attributes["operation.name"]) {
    return {};
  }

  const httpMethod = attributes["http.method"];
  const httpRoute = attributes["http.route"];

  // For server spans with HTTP info, add web.request operation
  if (
    kind === SpanKind.SERVER &&
    httpMethod &&
    typeof httpMethod === "string" &&
    httpRoute &&
    typeof httpRoute === "string"
  ) {
    return {
      "operation.name": "web.request",
      "resource.name": `${httpMethod} ${httpRoute}`,
    };
  }

  // Default operation name from library + kind
  const libraryName = cleanLibraryName(span.instrumentationLibrary.name);
  const kindName = getSpanKindName(kind);

  return {
    "operation.name": kindName ? `${libraryName}.${kindName}` : libraryName,
  };
}

/**
 * Clean library name for use in operation.name attribute.
 * Removes @ and replaces . / with underscores.
 */
function cleanLibraryName(name: string): string {
  let cleanName = name.replace(/[@./]/g, "_");

  if (cleanName.startsWith("_")) {
    cleanName = cleanName.slice(1);
  }

  return cleanName;
}

/**
 * Get string representation of SpanKind for operation.name.
 */
function getSpanKindName(kind: SpanKind): string {
  const names: Record<SpanKind, string> = {
    [SpanKind.INTERNAL]: "",
    [SpanKind.SERVER]: "server",
    [SpanKind.CLIENT]: "client",
    [SpanKind.PRODUCER]: "producer",
    [SpanKind.CONSUMER]: "consumer",
  };

  return names[kind] || "";
}
