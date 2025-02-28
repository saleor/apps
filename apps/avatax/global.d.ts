import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

declare global {
  var currentMetricReader: PeriodicExportingMetricReader | undefined;
}
