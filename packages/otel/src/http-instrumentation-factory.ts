import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

export const createHttpInstrumentation = () => {
  return new HttpInstrumentation({
    requireParentforIncomingSpans: true,
    requireParentforOutgoingSpans: true,
    ignoreOutgoingRequestHook: (request) =>
      request.hostname === "ingest.sentry.io" || request.path === "/v1/logs",
  });
};
