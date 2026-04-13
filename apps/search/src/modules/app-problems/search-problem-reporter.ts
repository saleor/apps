import { AppProblemsReporter } from "@saleor/app-problems";
import { type Client } from "urql";

import { AppDeactivateDocument } from "../../../generated/graphql";
import { type RecordTooLargeEntity } from "../../lib/algolia/algolia-error-parser";
import { createLogger } from "../../lib/logger";

const logger = createLogger("SearchProblemReporter");

export const PROBLEM_KEYS = {
  algoliaAuthError: "algolia-auth-error",
  algoliaRecordTooLarge: "algolia-record-too-large",
  algoliaIndexSetupFailed: "algolia-index-setup-failed",
  algoliaInvalidAppId: "algolia-invalid-app-id",
} as const;

export class SearchProblemReporter {
  private reporter: AppProblemsReporter;
  private client: Client;

  constructor(client: Client) {
    this.client = client;
    this.reporter = new AppProblemsReporter(client);
  }

  async reportAuthErrorAndDeactivate(appId: string): Promise<void> {
    try {
      const result = await this.reporter.reportProblem({
        key: PROBLEM_KEYS.algoliaAuthError,
        criticalThreshold: 1,
        message:
          "Algolia API key is invalid or expired. Product indexing will fail until valid credentials are configured. Please update your Algolia credentials in the Search App settings. The app deactivation will be attempted.",
      });

      if (result.isErr()) {
        logger.error("Failed to report auth error problem", { error: result.error });
      }
    } catch (e) {
      logger.warn("Failed to report auth error problem - API not available", { error: e });
    }

    await this.deactivateApp(appId);
  }

  async reportRecordTooLarge(entity: RecordTooLargeEntity): Promise<void> {
    const entityInfo =
      entity.type === "product_variant"
        ? `Product variant ${entity.variantId}`
        : entity.type === "category"
        ? `Category ${entity.categoryId}`
        : `Page ${entity.pageId}`;

    try {
      const result = await this.reporter.reportProblem({
        key: PROBLEM_KEYS.algoliaRecordTooLarge,
        message: `${entityInfo} exceeds Algolia's record size limit. Go to Search App settings and disable large fields in 'Algolia fields filtering' (e.g. description, metadata, media) to reduce record size. https://www.algolia.com/doc/guides/scaling/algolia-service-limits`,
      });

      if (result.isErr()) {
        logger.error("Failed to report record too large problem", { error: result.error });
      }
    } catch (e) {
      logger.warn("Failed to report record too large problem - API not available", { error: e });
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
      logger.warn("Failed to report index setup failure problem - API not available", {
        error: e,
      });
    }
  }

  async reportInvalidAppIdAndDeactivate(appId: string): Promise<void> {
    try {
      const result = await this.reporter.reportProblem({
        key: PROBLEM_KEYS.algoliaInvalidAppId,
        criticalThreshold: 1,
        message:
          "Algolia Application ID does not exist. The app has been deactivated. Please verify your Algolia Application ID in the Search App settings and reactivate the app.",
      });

      if (result.isErr()) {
        logger.error("Failed to report invalid app ID problem", { error: result.error });
      }
    } catch (e) {
      logger.warn("Failed to report invalid app ID problem - API not available", { error: e });
    }

    await this.deactivateApp(appId);
  }

  private async deactivateApp(appId: string): Promise<void> {
    try {
      const result = await this.client.mutation(AppDeactivateDocument, { id: appId }).toPromise();

      if (result.error) {
        logger.error("Failed to deactivate app", { error: result.error });

        return;
      }

      const errors = result.data?.appDeactivate?.errors;

      if (errors && errors.length > 0) {
        logger.error("Failed to deactivate app", {
          errorMessages: errors.map((e) => e.message),
        });

        return;
      }
    } catch (e) {
      logger.warn("Failed to deactivate app - API not available", { error: e });
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
