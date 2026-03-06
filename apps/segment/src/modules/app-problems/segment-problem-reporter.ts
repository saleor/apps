import { AppProblemsReporter } from "@saleor/app-problems";
import { type Client } from "urql";

import { createLogger } from "@/logger";

const logger = createLogger("SegmentProblemReporter");

export const PROBLEM_KEYS = {
  configMissing: "segment-config-missing",
  trackingFailed: "segment-tracking-failed",
  webhooksDisabled: "segment-webhooks-disabled",
} as const;

export class SegmentProblemReporter {
  private reporter: AppProblemsReporter;

  constructor(client: Client) {
    this.reporter = new AppProblemsReporter(client);
  }

  async reportConfigMissing(): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.configMissing,
      criticalThreshold: 1,
      message:
        "Segment app has no configuration saved. All order events are being silently dropped. Please configure the Segment Write Key in the app settings.",
    });

    if (result.isErr()) {
      logger.warn("Failed to report config missing problem", { error: result.error });
    }
  }

  async reportTrackingFailed(errorMessage: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.trackingFailed,
      message: `Segment rejected an order event: ${errorMessage}. This may indicate an invalid Write Key or a network error. Please verify your Segment Write Key.`,
    });

    if (result.isErr()) {
      logger.warn("Failed to report tracking failed problem", { error: result.error });
    }
  }

  async reportWebhooksDisabled(errorMessage: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.webhooksDisabled,
      criticalThreshold: 1,
      message: `Segment app configuration was saved, but enabling webhooks failed: ${errorMessage}. Order events will not be received until webhooks are re-enabled. Try saving your configuration again or contact support.`,
    });

    if (result.isErr()) {
      logger.warn("Failed to report webhooks disabled problem", { error: result.error });
    }
  }

  async clearAllProblems(): Promise<void> {
    const result = await this.reporter.clearProblems([
      PROBLEM_KEYS.configMissing,
      PROBLEM_KEYS.trackingFailed,
      PROBLEM_KEYS.webhooksDisabled,
    ]);

    if (result.isErr()) {
      logger.warn("Failed to clear all Segment problems", { error: result.error });
    }
  }
}
