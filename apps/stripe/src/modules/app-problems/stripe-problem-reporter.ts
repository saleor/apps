import { AppProblemsReporter } from "@saleor/app-problems";
import { type Client } from "urql";

import { createLogger } from "@/lib/logger";
import {
  type StripeApiError,
  StripeAuthenticationError,
  StripePermissionError,
} from "@/modules/stripe/stripe-api-error";

const logger = createLogger("StripeProblemReporter");

export const PROBLEM_KEYS = {
  authFailure: (configId: string) => `stripe-auth-failure:${configId}`,
  permissionError: (configId: string) => `stripe-permission-error:${configId}`,
  webhookSecretMismatch: (configId: string) => `stripe-webhook-secret-mismatch:${configId}`,
  configMissing: (configId: string) => `stripe-config-missing:${configId}`,
  invalidPaymentMethod: (channelSlug: string) => `stripe-invalid-payment-method:${channelSlug}`,
} as const;

export class StripeProblemReporter {
  private reporter: AppProblemsReporter;

  constructor(client: Client) {
    this.reporter = new AppProblemsReporter(client);
  }

  async reportAuthFailure(configId: string, configName: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.authFailure(configId),
      criticalThreshold: 1,
      message: `Stripe restricted key for configuration "${configName}" is invalid or expired. Payments for channels using this configuration will fail. Please update the restricted key.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report auth failure problem", { error: result.error });
    }
  }

  async reportPermissionError(configId: string, configName: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.permissionError(configId),
      criticalThreshold: 1,
      message: `Stripe restricted key for configuration "${configName}" lacks required permissions. Payments for channels using this configuration will fail. Please verify the key has the necessary Stripe permissions.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report permission error problem", { error: result.error });
    }
  }

  async reportWebhookSecretMismatch(configId: string, configName: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.webhookSecretMismatch(configId),
      criticalThreshold: 1,
      message: `Webhook signature verification failed for configuration "${configName}". Payment status updates from Stripe are not being processed. The webhook secret may have been rotated in Stripe. Please recreate the configuration.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report webhook secret mismatch problem", { error: result.error });
    }
  }

  async reportConfigMissing(configId: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.configMissing(configId),
      criticalThreshold: 1,
      message: `Stripe is sending webhook events for configuration "${configId}" but no matching configuration was found. The configuration may have been deleted while the Stripe webhook endpoint is still active. Please remove the orphaned webhook in your Stripe Dashboard.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report config missing problem", { error: result.error });
    }
  }

  async reportInvalidPaymentMethod(channelSlug: string) {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.invalidPaymentMethod(channelSlug),
      message: `Storefront is using Payment Method that is not supported. Verify app docs and disable not supported payment methods in Stripe. Channel: ${channelSlug}`,
    });

    if (result.isErr()) {
      logger.error("Failed to report config missing problem", { error: result.error });
    }
  }

  async clearProblemsForConfig(configId: string): Promise<void> {
    const keys = Object.values(PROBLEM_KEYS).map((fn) => fn(configId));
    const result = await this.reporter.clearProblems(keys);

    if (result.isErr()) {
      logger.error("Failed to clear problems for config", { error: result.error, configId });
    }
  }

  async reportApiProblem(
    error: StripeApiError,
    config: { id: string; name: string },
  ): Promise<void> {
    if (error instanceof StripeAuthenticationError) {
      await this.reportAuthFailure(config.id, config.name);
    } else if (error instanceof StripePermissionError) {
      await this.reportPermissionError(config.id, config.name);
    }
  }
}
