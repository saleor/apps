import { AppProblemsReporter } from "@saleor/app-problems";
import { type Client } from "urql";

import { createLogger } from "@/logger";

const logger = createLogger("CmsProblemReporter");

export const PROBLEM_KEYS = {
  providerAuthError: (providerId: string) => `cms-provider-auth-error:${providerId}`,
  builderIoFailure: (providerId: string) => `cms-builder-io-silent-failure:${providerId}`,
  fieldMismatch: (providerId: string) => `cms-field-mismatch:${providerId}`,
  syncFailure: (providerId: string) => `cms-sync-failure:${providerId}`,
} as const;

export class CmsProblemReporter {
  private reporter: AppProblemsReporter;

  constructor(client: Client) {
    this.reporter = new AppProblemsReporter(client);
  }

  async reportProviderAuthError(
    providerId: string,
    providerType: string,
    configName: string,
  ): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.providerAuthError(providerId),
      criticalThreshold: 1,
      message: `CMS provider "${configName}" (${providerType}) returned an authentication error. Product variant syncing for channels using this provider will fail. Please verify the API credentials.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report provider auth error problem", { error: result.error });
    }
  }

  async reportBuilderIoFailure(
    providerId: string,
    configName: string,
    errorMessage: string,
  ): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.builderIoFailure(providerId),
      criticalThreshold: 1,
      message: `Builder.io provider "${configName}" returned an HTTP error: ${errorMessage}. Product variant syncing will fail silently. Please check your Builder.io configuration.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report Builder.io failure problem", { error: result.error });
    }
  }

  async reportFieldMismatch(
    providerId: string,
    configName: string,
    errorMessage: string,
  ): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.fieldMismatch(providerId),
      message: `CMS provider "${configName}" returned a field validation error: ${errorMessage}. Please verify the field mapping configuration matches your CMS content model.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report field mismatch problem", { error: result.error });
    }
  }

  async reportSyncFailure(
    providerId: string,
    provider: { type: string; configName: string },
    errorMessage: string,
  ): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.syncFailure(providerId),
      criticalThreshold: 1,
      message: `CMS provider "${provider.configName}" (${provider.type}) failed to sync a product variant: ${errorMessage}. Please check the provider configuration and connectivity.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report sync failure problem", { error: result.error });
    }
  }

  async clearProblemsForProvider(providerId: string): Promise<void> {
    const keys = [
      PROBLEM_KEYS.providerAuthError(providerId),
      PROBLEM_KEYS.builderIoFailure(providerId),
      PROBLEM_KEYS.fieldMismatch(providerId),
      PROBLEM_KEYS.syncFailure(providerId),
    ];
    const result = await this.reporter.clearProblems(keys);

    if (result.isErr()) {
      logger.error("Failed to clear problems for provider", { error: result.error, providerId });
    }
  }
}
