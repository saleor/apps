import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

export const createHttpInstrumentation = () => {
  return new HttpInstrumentation({
    requireParentforIncomingSpans: true,
    requireParentforOutgoingSpans: true,
    ignoreOutgoingUrls: [
      (url) => url.includes("ingest.sentry.io"),
      (url) => url.includes("/v1/logs"),
    ],
  });
};
