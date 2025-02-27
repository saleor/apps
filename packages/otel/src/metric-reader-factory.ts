import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

export const createMetricReader = (args: {
  accessToken: string | undefined;
  exportIntervalMillis: number;
}) => {
  return new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      headers: {
        "x-alb-access-token": args.accessToken,
      },
    }),
    exportIntervalMillis: args.exportIntervalMillis,
  });
};
