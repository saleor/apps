import { type ResultAsync } from "neverthrow";

import { type BaseError } from "../../errors";
import { createLogger } from "../../logger";
import { type FallbackSmtpConfig } from "./fallback-smtp-config-repository";
import { parseFallbackRegisterData } from "./fallback-register-data";

const logger = createLogger("onAuthAplSaved:fallback");

export interface ISetFallbackConfig {
  setFallbackConfig(
    config: FallbackSmtpConfig,
  ): ResultAsync<void, InstanceType<typeof BaseError>>;
}

export async function saveFallbackConfigOnRegister({
  rawBody,
  fallbackService,
}: {
  rawBody: Record<string, unknown>;
  fallbackService: ISetFallbackConfig;
}): Promise<void> {
  const registerData = parseFallbackRegisterData(rawBody);

  if (!registerData) {
    logger.debug("No fallback register data found, skipping");

    return;
  }

  logger.info("Saving fallback config from register data", {
    fallbackEnabled: registerData.fallbackEnabled,
    fallbackRedirectEmail: registerData.fallbackRedirectEmail ? "Provided" : "Not provided",
  });

  const fallbackResult = await fallbackService.setFallbackConfig({
    fallbackEnabled: registerData.fallbackEnabled,
    fallbackRedirectEmail: registerData.fallbackRedirectEmail ?? null,
  });

  if (fallbackResult.isErr()) {
    logger.error("Failed to save fallback SMTP config, aborting installation", {
      error: fallbackResult.error,
    });

    throw new Error("Failed to save fallback SMTP config to DynamoDB", {
      cause: fallbackResult.error,
    });
  }
}
