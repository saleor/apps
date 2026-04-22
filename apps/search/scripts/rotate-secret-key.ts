import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { fetchMetadataRotationItems } from "@saleor/apps-shared/key-rotation/fetch-metadata-rotation-items";
import { saveMetadataRotationItem } from "@saleor/apps-shared/key-rotation/save-metadata-rotation-item";
import { SecretKeyRotationRunner } from "@saleor/apps-shared/key-rotation/secret-key-rotation-runner";
import {
  resolveRotationSourceKeys,
  resolveRotationTargetKey,
} from "@saleor/apps-shared/secret-key-resolution";
import * as Sentry from "@sentry/nextjs";

import { saleorApp } from "../saleor-app";
import { env } from "../src/env";
import { ALL_ENCRYPTED_METADATA_KEYS } from "../src/lib/encrypted-metadata-keys";
import { createMigrationScriptLogger } from "./migrations/migration-logger";

const logger = createMigrationScriptLogger("RotateSecretKey");

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  includeLocalVariables: true,
  skipOpenTelemetrySetup: true,
  ignoreErrors: [],
  integrations: [],
});

const runner = new SecretKeyRotationRunner({
  secretKey: resolveRotationTargetKey(env),
  fallbackKeys: resolveRotationSourceKeys(env),
  dryRun: process.argv.includes("--dry-run"),
  logger,
  decrypt,
  encrypt,
  getItems: () => fetchMetadataRotationItems(saleorApp.apl, logger, ALL_ENCRYPTED_METADATA_KEYS),
  saveItem: saveMetadataRotationItem,
});

runner
  .run()
  .then(({ failed }) => {
    if (failed > 0) process.exit(1);
  })
  .catch(async (error) => {
    logger.error("Fatal error during secret key rotation", { error: error });
    Sentry.captureException(error);
    await Sentry.flush(5000);
    process.exit(1);
  });
