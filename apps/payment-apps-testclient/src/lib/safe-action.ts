import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";

import { createLogger } from "./logger";

const logger = createLogger("serverAction");

export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(error, utils) {
    logger.error(`Error during ${utils.metadata.actionName} action handling:`, {
      error: error,
      actionName: utils.metadata.actionName,
    });

    throw error;
  },
});
