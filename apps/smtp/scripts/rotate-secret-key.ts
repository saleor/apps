import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { collectFallbackSecretKeys } from "@saleor/apps-shared/fallback-secret-keys";
import { fetchMetadataRotationItems } from "@saleor/apps-shared/key-rotation/fetch-metadata-rotation-items";
import { saveMetadataRotationItem } from "@saleor/apps-shared/key-rotation/save-metadata-rotation-item";
import { SecretKeyRotationRunner } from "@saleor/apps-shared/key-rotation/secret-key-rotation-runner";

import { env } from "../src/env";
import { createLogger } from "../src/logger";
import { saleorApp } from "../src/saleor-app";

const logger = createLogger("rotate-secret-key");

const runner = new SecretKeyRotationRunner({
  secretKey: env.SECRET_KEY,
  fallbackKeys: collectFallbackSecretKeys(env),
  dryRun: process.argv.includes("--dry-run"),
  logger,
  decrypt,
  encrypt,
  getItems: () => fetchMetadataRotationItems(saleorApp.apl, logger),
  saveItem: saveMetadataRotationItem,
});

runner
  .run()
  .then(({ failed }) => {
    if (failed > 0) process.exit(1);
  })
  .catch((error) => {
    logger.error("Secret key rotation failed", { error: error });
    process.exit(1);
  });
