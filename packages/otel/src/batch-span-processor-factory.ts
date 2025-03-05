import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

export const createBatchSpanProcessor = (args: { accessToken: string | undefined }) => {
  const headers = args.accessToken ? { "x-alb-access-token": args.accessToken } : undefined;

  return new BatchSpanProcessor(
    new OTLPTraceExporter({
      headers,
    }),
  );
};
