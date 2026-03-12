import { AppProblemsReporter } from "@saleor/app-problems";
import { type Client } from "urql";

import { createLogger } from "@/logger";
import {
  AvataxEntityNotFoundError,
  AvataxForbiddenAccessError,
  AvataxGetTaxSystemError,
  AvataxInvalidCredentialsError,
} from "@/modules/taxes/tax-error";

const logger = createLogger("AvataxProblemReporter");

export const PROBLEM_KEYS = {
  invalidCredentials: (configId: string) => `avatax-invalid-credentials:${configId}`,
  forbiddenAccess: (configId: string) => `avatax-forbidden-access:${configId}`,
  companyInactive: (configId: string) => `avatax-company-inactive:${configId}`,
  companyNotFound: (configId: string) => `avatax-company-not-found:${configId}`,
  entityNotFound: (configId: string) => `avatax-entity-not-found:${configId}`,
  suspiciousZeroTax: (configId: string) => `avatax-suspicious-zero-tax:${configId}`,
  taxCodePermission: (configId: string) => `avatax-tax-code-permission:${configId}`,
  channelConfigMissing: (channelSlug: string) => `avatax-channel-config-missing:${channelSlug}`,
} as const;

export class AvataxProblemReporter {
  private reporter: AppProblemsReporter;

  constructor(client: Client) {
    this.reporter = new AppProblemsReporter(client);
  }

  async reportInvalidCredentials(configId: string, configName: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.invalidCredentials(configId),
      criticalThreshold: 1,
      message: `AvaTax credentials for configuration "${configName}" are invalid. Tax calculations for channels using this configuration will fail. Please update the credentials.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report invalid credentials problem", { error: result.error });
    }
  }

  async reportForbiddenAccess(configId: string, configName: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.forbiddenAccess(configId),
      criticalThreshold: 1,
      message: `AvaTax credentials for configuration "${configName}" lack required permissions. Tax calculations for channels using this configuration will fail. Please verify the account permissions with Avalara support.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report forbidden access problem", { error: result.error });
    }
  }

  async reportCompanyInactive(
    configId: string,
    configName: string,
    companyCode: string,
  ): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.companyInactive(configId),
      criticalThreshold: 1,
      message: `AvaTax company "${companyCode}" in configuration "${configName}" is inactive. Tax calculations will fail until the company is reactivated in AvaTax.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report company inactive problem", { error: result.error });
    }
  }

  async reportCompanyNotFound(
    configId: string,
    configName: string,
    companyCode: string,
  ): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.companyNotFound(configId),
      criticalThreshold: 1,
      message: `AvaTax company "${companyCode}" in configuration "${configName}" was not found. Tax calculations will fail. Please verify the company code in your AvaTax configuration.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report company not found problem", { error: result.error });
    }
  }

  async reportEntityNotFound(
    configId: string,
    configName: string,
    description: string,
  ): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.entityNotFound(configId),
      criticalThreshold: 1,
      message: `AvaTax returned "Entity not found" error for configuration "${configName}": ${description}. Tax calculations for channels using this configuration will fail until the issue is resolved.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report entity not found problem", { error: result.error });
    }
  }

  async reportSuspiciousZeroTax(configId: string, configName: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.suspiciousZeroTax(configId),
      message: `Tax calculation for configuration "${configName}" returned zero tax for a line with a non-zero tax rate. This may indicate a configuration issue in AvaTax. Please review your tax rules.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report suspicious zero tax problem", { error: result.error });
    }
  }

  async reportTaxCodePermission(configId: string, configName: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.taxCodePermission(configId),
      message: `AvaTax returned "Not Permitted" error when fetching tax codes for configuration "${configName}". Verify your license permissions with Avalara support.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report tax code permission problem", { error: result.error });
    }
  }

  async reportChannelConfigMissing(channelSlug: string, reason: string): Promise<void> {
    const result = await this.reporter.reportProblem({
      key: PROBLEM_KEYS.channelConfigMissing(channelSlug),
      criticalThreshold: 1,
      message: `Tax calculations are failing for channel "${channelSlug}": ${reason}. Please update the channel configuration.`,
    });

    if (result.isErr()) {
      logger.error("Failed to report channel config missing problem", { error: result.error });
    }
  }

  async clearChannelConfigProblem(channelSlug: string): Promise<void> {
    const result = await this.reporter.clearProblems([
      PROBLEM_KEYS.channelConfigMissing(channelSlug),
    ]);

    if (result.isErr()) {
      logger.error("Failed to clear channel config problem", { error: result.error, channelSlug });
    }
  }

  async reportApiProblem(
    error: unknown,
    config: { id: string; name: string; companyCode?: string },
  ): Promise<void> {
    if (error instanceof AvataxInvalidCredentialsError) {
      await this.reportInvalidCredentials(config.id, config.name);
    } else if (error instanceof AvataxForbiddenAccessError) {
      await this.reportForbiddenAccess(config.id, config.name);
    } else if (error instanceof AvataxEntityNotFoundError) {
      await this.reportEntityNotFound(config.id, config.name, error.description);
    } else if (error instanceof AvataxGetTaxSystemError) {
      if (error.faultSubCode === "InactiveCompanyError") {
        await this.reportCompanyInactive(config.id, config.name, config.companyCode ?? "unknown");
      } else if (error.faultSubCode === "CompanyNotFoundError") {
        await this.reportCompanyNotFound(config.id, config.name, config.companyCode ?? "unknown");
      }
    }
  }

  async clearProblemsForConfig(configId: string): Promise<void> {
    const keys = [
      PROBLEM_KEYS.invalidCredentials(configId),
      PROBLEM_KEYS.forbiddenAccess(configId),
      PROBLEM_KEYS.companyInactive(configId),
      PROBLEM_KEYS.companyNotFound(configId),
      PROBLEM_KEYS.entityNotFound(configId),
      PROBLEM_KEYS.suspiciousZeroTax(configId),
      PROBLEM_KEYS.taxCodePermission(configId),
    ];
    const result = await this.reporter.clearProblems(keys);

    if (result.isErr()) {
      logger.error("Failed to clear problems for config", { error: result.error, configId });
    }
  }
}
