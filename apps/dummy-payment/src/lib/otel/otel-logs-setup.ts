import { logs } from "@opentelemetry/api-logs";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import {
  detectResourcesSync,
  envDetectorSync,
  hostDetectorSync,
  osDetectorSync,
  processDetector,
} from "@opentelemetry/resources";
import { sharedOtelConfig } from "./shared-config";

const batchLogRecordProcessor = new BatchLogRecordProcessor(
  new OTLPLogExporter({
    headers: sharedOtelConfig.exporterHeaders,
  }),
  sharedOtelConfig.batchProcessorConfig,
);

export const otelLogsProcessor = batchLogRecordProcessor;

const detectedResource = detectResourcesSync({
  detectors: [envDetectorSync, hostDetectorSync, osDetectorSync, processDetector],
});

export const loggerProvider = new LoggerProvider({
  resource: detectedResource,
  forceFlushTimeoutMillis: sharedOtelConfig.flushTimeout,
});

loggerProvider.addLogRecordProcessor(otelLogsProcessor);
logs.setGlobalLoggerProvider(loggerProvider);
