import { AppProblemsReporter } from "@saleor/app-problems";
import { Client } from "urql";

import { createLogger } from "@/logger";
import {
  AvataxForbiddenAccessError,
  AvataxGetTaxSystemError,
  AvataxInvalidCredentialsError,
} from "@/modules/taxes/tax-error";

const logger = createLogger("AvataxProblemReporter");

const MIN_SALEOR_VERSION = { major: 3, minor: 22 };

/**
 * Checks if the Saleor version supports appProblemCreate (>= 3.22).
 * Returns false if version is missing or cannot be parsed.
 */
export function isSaleorVersionCompatible(saleorVersion: string | undefined | null): boolean {
  if (!saleorVersion) {
    return false;
  }

  const parts = saleorVersion.split(".");
  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);

  if (isNaN(major) || isNaN(minor)) {
    return false;
  }

  if (major > MIN_SALEOR_VERSION.major) {
    return true;
  }

  return major === MIN_SALEOR_VERSION.major && minor >= MIN_SALEOR_VERSION.minor;
}

export const AVATAX_PROBLEM_KEYS = {
  INVALID_CREDENTIALS: "avatax-invalid-credentials",
  FORBIDDEN_ACCESS: "avatax-forbidden-access",
  COMPANY_INACTIVE: "avatax-company-inactive",
  COMPANY_NOT_FOUND: "avatax-company-not-found",
} as const;

const PROBLEM_MESSAGES: Record<string, string> = {
  [AVATAX_PROBLEM_KEYS.INVALID_CREDENTIALS]:
    "AvaTax API credentials are invalid or expired. Tax calculations are failing. Please update your AvaTax credentials in the app configuration.",
  [AVATAX_PROBLEM_KEYS.FORBIDDEN_ACCESS]:
    "AvaTax API key lacks required permissions (PermissionRequired). Please verify your AvaTax license permissions with Avalara support.",
  [AVATAX_PROBLEM_KEYS.COMPANY_INACTIVE]:
    "AvaTax company account is inactive. Tax operations are not allowed. Please reactivate your company in AvaTax or update the configuration.",
  [AVATAX_PROBLEM_KEYS.COMPANY_NOT_FOUND]:
    "AvaTax company code not found. The configured company does not exist. Please verify the company code in your AvaTax configuration.",
};

function createReporter(client: Client) {
  return new AppProblemsReporter(client);
}

async function reportProblem(
  reporter: AppProblemsReporter,
  key: string,
  criticalThreshold?: number,
) {
  const message = PROBLEM_MESSAGES[key];

  if (!message) {
    logger.error("Unknown problem key", { key });

    return;
  }

  const result = await reporter.reportProblem({
    key,
    message,
    ...(criticalThreshold !== undefined ? { criticalThreshold } : {}),
  });

  result.mapErr((error) => {
    logger.error("Failed to report app problem to Saleor", { error, key });
  });
}

/**
 * Maps a caught AvaTax error to an appropriate app problem report.
 * Should be called in `after()` to avoid blocking the webhook response.
 *
 * @param saleorVersion - The Saleor version from `payload.version`. Required to gate
 *   the feature to Saleor >= 3.22 which introduced appProblemCreate.
 */
export async function reportAvataxProblemFromError(
  client: Client,
  error: unknown,
  saleorVersion: string | undefined | null,
) {
  if (!isSaleorVersionCompatible(saleorVersion)) {
    logger.debug("Skipping app problem report - Saleor version does not support appProblemCreate", {
      saleorVersion,
    });

    return;
  }

  const reporter = createReporter(client);

  if (error instanceof AvataxInvalidCredentialsError) {
    await reportProblem(reporter, AVATAX_PROBLEM_KEYS.INVALID_CREDENTIALS, 1);

    return;
  }

  if (error instanceof AvataxForbiddenAccessError) {
    await reportProblem(reporter, AVATAX_PROBLEM_KEYS.FORBIDDEN_ACCESS, 1);

    return;
  }

  if (error instanceof AvataxGetTaxSystemError) {
    const faultSubCode = error.faultSubCode;

    if (faultSubCode === "InactiveCompanyError") {
      await reportProblem(reporter, AVATAX_PROBLEM_KEYS.COMPANY_INACTIVE, 1);

      return;
    }

    if (faultSubCode === "CompanyNotFoundError") {
      await reportProblem(reporter, AVATAX_PROBLEM_KEYS.COMPANY_NOT_FOUND, 1);

      return;
    }
  }
}
