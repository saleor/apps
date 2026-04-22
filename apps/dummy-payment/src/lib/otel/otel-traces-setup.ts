import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor, ReadableSpan } from "@opentelemetry/sdk-trace-base";
import { sharedOtelConfig } from "./shared-config";

class CustomSpanProcessor extends BatchSpanProcessor {
  onEnd(span: ReadableSpan): void {
    /**
     * Next.js has a bug and API functions don't propagate proper name.
     * https://github.com/vercel/next.js/blob/faa44210340d2ef19da6252e40a9b3e66f214637/packages/next/src/server/base-server.ts#L821
     *
     * Filter them out - they duplicate child span that have similar attributes.
     *
     * TODO: Verify with latest next.js versions
     */
    const isBrokenNextSpan =
      span.instrumentationLibrary.name === "next.js" && !span.attributes["next.route"];

    if (!isBrokenNextSpan) {
      super.onEnd(span);
    }
  }
}

export const batchSpanProcessor = new CustomSpanProcessor(
  new OTLPTraceExporter({
    headers: sharedOtelConfig.exporterHeaders,
    timeoutMillis: sharedOtelConfig.flushTimeout,
  }),
  sharedOtelConfig.batchProcessorConfig,
);
