import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

export const createBatchSpanProcessor = (args: { accessToken: string | undefined }) => {
  return new BatchSpanProcessor(
    new OTLPTraceExporter({
      headers: {
        "x-alb-access-token": args.accessToken,
      },
    }),
  );
};
