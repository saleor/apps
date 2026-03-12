import { AppProblemsReporter } from "@saleor/app-problems";
import { type Client } from "urql";

import { createLogger } from "@/logger";

const logger = createLogger("ProductsFeedProblemReporter");

export const PROBLEM_KEYS = {
  s3UploadFailed: (channel: string) => `feed-s3-upload-failed:${channel}`,
  emptyProducts: (channel: string) => `feed-empty-products:${channel}`,
  s3NotConfigured: (channel: string) => `feed-s3-not-configured:${channel}`,
} as const;

export class ProductsFeedProblemReporter {
  private reporter: AppProblemsReporter;

  constructor(client: Client) {
    this.reporter = new AppProblemsReporter(client);
  }

  async reportS3UploadFailed(channel: string, errorMessage: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.s3UploadFailed(channel),
      message: `Failed to upload product feed to S3 for channel "${channel}": ${errorMessage}. Please verify your S3 credentials and bucket permissions.`,
    });

    if (result.isErr()) {
      logger.warn("Failed to report S3 upload failure problem", { error: result.error });
    }
  }

  async reportEmptyProducts(channel: string, errorMessage: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.emptyProducts(channel),
      criticalThreshold: 1,
      message: `Product feed for channel "${channel}" returned no products due to a GraphQL error: ${errorMessage}. The generated feed will be empty.`,
    });

    if (result.isErr()) {
      logger.warn("Failed to report empty products problem", { error: result.error });
    }
  }

  async reportS3NotConfigured(channel: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.s3NotConfigured(channel),
      message: `S3 bucket is not configured for channel "${channel}". Please configure the S3 bucket in the app settings to enable product feed generation.`,
    });

    if (result.isErr()) {
      logger.warn("Failed to report S3 not configured problem", { error: result.error });
    }
  }

  async clearProblemsForChannel(channel: string): Promise<void> {
    const keys = [
      PROBLEM_KEYS.s3UploadFailed(channel),
      PROBLEM_KEYS.emptyProducts(channel),
      PROBLEM_KEYS.s3NotConfigured(channel),
    ];
    const result = await this.reporter.clearProblems(keys);

    if (result.isErr()) {
      logger.warn("Failed to clear problems for channel", { error: result.error, channel });
    }
  }
}
