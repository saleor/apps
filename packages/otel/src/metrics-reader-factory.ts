import {
  AggregationTemporalityPreference,
  OTLPMetricExporter,
} from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

export const createMetricsReader = (args: { accessToken: string | undefined }) => {
  const headers = args.accessToken ? { "x-alb-access-token": args.accessToken } : undefined;

  return new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      temporalityPreference: AggregationTemporalityPreference.DELTA,
      headers,
    }),
  });
};
