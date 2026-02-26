import { AppProblemsReporter } from "@saleor/app-problems";
import { type Client } from "urql";

import { createLogger } from "../../lib/logger";

const logger = createLogger("SearchProblemReporter");

export const PROBLEM_KEYS = {
  algoliaAuthError: "algolia-auth-error",
  algoliaRecordTooLarge: "algolia-record-too-large",
  algoliaIndexSetupFailed: "algolia-index-setup-failed",
} as const;

export class SearchProblemReporter {
  private reporter: AppProblemsReporter;

  constructor(client: Client) {
    this.reporter = new AppProblemsReporter(client);
  }

  async reportAuthError(): Promise<void> {
    try {
      const result = await this.reporter.reportProblem({
        key: PROBLEM_KEYS.algoliaAuthError,
        criticalThreshold: 1,
        message:
          "Algolia API key is invalid or expired. Product indexing will fail until valid credentials are configured. Please update your Algolia credentials in the Search App settings.",
      });

      if (result.isErr()) {
        logger.error("Failed to report auth error problem", { error: result.error });
      }
    } catch (e) {
      logger.warn("Failed to report auth error problem - API not available", { error: e });
    }
  }

  async reportRecordTooLarge(context: { productId?: string; variantId?: string }): Promise<void> {
    const entityInfo = context.variantId
      ? `Product variant ${context.variantId}`
      : context.productId
      ? `Product ${context.productId}`
      : "A product";

    try {
      const result = await this.reporter.reportProblem({
        key: PROBLEM_KEYS.algoliaRecordTooLarge,
        message: `${entityInfo} exceeds Algolia's record size limit (10KB). Go to Search App settings and disable large fields in 'Algolia fields filtering' (e.g. description, metadata, media) to reduce record size.`,
      });

      if (result.isErr()) {
        logger.error("Failed to report record too large problem", { error: result.error });
      }
    } catch (e) {
      logger.error("Failed to report record too large problem - API not available", { error: e });
    }
  }

  async reportIndexSetupFailed(): Promise<void> {
    try {
      const result = await this.reporter.reportProblem({
        key: PROBLEM_KEYS.algoliaIndexSetupFailed,
        criticalThreshold: 1,
        message:
          "Failed to update Algolia index settings. Search results may not be configured correctly. Please verify your Algolia credentials and try updating indices again.",
      });

      if (result.isErr()) {
        logger.error("Failed to report index setup failure problem", { error: result.error });
      }
    } catch (e) {
      logger.error("Failed to report index setup failure problem - API not available", {
        error: e,
      });
    }
  }

  async clearAuthProblems(): Promise<void> {
    try {
      const result = await this.reporter.clearProblems([
        PROBLEM_KEYS.algoliaAuthError,
        PROBLEM_KEYS.algoliaIndexSetupFailed,
      ]);

      if (result.isErr()) {
        logger.error("Failed to clear auth problems", { error: result.error });
      }
    } catch (e) {
      logger.warn("Failed to clear auth problems - API not available", { error: e });
    }
  }
}
