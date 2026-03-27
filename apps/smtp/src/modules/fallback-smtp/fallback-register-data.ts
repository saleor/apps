import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { createLogger } from "../../logger";

const logger = createLogger("FallbackRegisterData");

const fallbackRegisterDataSchema = z.object({
  fallbackEnabled: z.boolean(),
  fallbackRedirectEmail: z.string().email().nullish(),
});

export type FallbackRegisterData = z.infer<typeof fallbackRegisterDataSchema>;

export function parseFallbackRegisterData(
  rawBody: Record<string, unknown>,
): FallbackRegisterData | null {
  const additionalData = rawBody.additional_data;

  if (!additionalData || typeof additionalData !== "object") {
    logger.debug("No additional_data in register request");

    return null;
  }

  const result = fallbackRegisterDataSchema.safeParse(additionalData);

  if (!result.success) {
    /**
     * Saleor sent invalid request
     * for security reasons we disable Sandbox SMTP server completely
     *
     * Can be enabled manually via DynamoDB
     */
    const cause = result.error.flatten().fieldErrors;
    const error = new Error("Invalid additional_data in register request", {
      cause,
    });

    logger.error(error.message, {
      errors: cause,
    });

    Sentry.captureException(error);

    return { fallbackEnabled: false, fallbackRedirectEmail: null };
  }

  return result.data;
}
