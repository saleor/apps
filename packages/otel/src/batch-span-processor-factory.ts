import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

export const createBatchSpanProcessor = (args: { accessToken: string }) => {
  return new BatchSpanProcessor(
    new OTLPTraceExporter({
      headers: {
        "x-alb-access-token": args.accessToken,
      },
    }),
  );
};
