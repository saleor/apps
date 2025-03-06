import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

export const createHttpInstrumentation = () => {
  return new HttpInstrumentation({
    requireParentforIncomingSpans: true,
    requireParentforOutgoingSpans: true,
    ignoreOutgoingRequestHook: (request) => request.hostname?.includes("ingest.sentry.io") ?? false,
  });
};
