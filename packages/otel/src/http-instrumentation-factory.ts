import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

interface HttpInstrumentationFactoryConfig {
  /**
   * Set to true when using DeferredSampler + TailSamplingProcessor.
   * This allows root spans (requests without traceparent set by Saleor and others)
   * to be sampled if app decides to sample.
   */
  usingDeferredSpanProcessor?: boolean;
}

export const createHttpInstrumentation = (config?: HttpInstrumentationFactoryConfig) => {
  const { usingDeferredSpanProcessor = false } = config ?? {};

  return new HttpInstrumentation({
    requireParentforIncomingSpans: !usingDeferredSpanProcessor,
    requireParentforOutgoingSpans: true,
    ignoreOutgoingRequestHook: (request) => request.hostname?.includes("ingest.sentry.io") ?? false,
  });
};
