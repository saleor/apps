import { BufferConfig } from "@opentelemetry/sdk-logs";

const FLUSH_TIMEOUT = 1_000;

const batchProcessorConfig: BufferConfig = {
  exportTimeoutMillis: FLUSH_TIMEOUT,
  maxExportBatchSize: 1024,
  maxQueueSize: 1024,
  /**
   * Long delay that will be for sure longer than the lambda timeout.
   * Avoid mid-execution flushes, because we flush them manually in the end.
   */
  scheduledDelayMillis: 2 * 5 * 60 * 1000,
};

export const sharedOtelConfig = {
  flushTimeout: FLUSH_TIMEOUT,
  batchProcessorConfig: batchProcessorConfig,
  exporterHeaders: {
    /**
     * This is the token that is used to authenticate with the OTEL collector set up in the Saleor infrastructure.
     *
     * In case of forked usage, leave this field empty, but protecting collector is recommended.
     */
    "x-alb-access-token": process.env.OTEL_ACCESS_TOKEN,
  },
} as const;
