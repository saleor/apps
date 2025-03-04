import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

export const createBatchSpanProcessor = (args: { accessToken: string | undefined }) => {
  if (!args.accessToken) {
    throw new Error("Access token is required to create a batch span processor");
  }

  return new BatchSpanProcessor(
    new OTLPTraceExporter({
      headers: {
        "x-alb-access-token": args.accessToken,
      },
    }),
  );
};
