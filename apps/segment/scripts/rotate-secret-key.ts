import { parseArgs } from "node:util";

import { decrypt, encrypt } from "@saleor/app-sdk/settings-manager";
import { createDynamoDBSecretKeyRotationRunner } from "@saleor/apps-shared/key-rotation/dynamodb-secret-key-rotation-runner";
import {
  resolveRotationSourceKeys,
  resolveRotationTargetKey,
} from "@saleor/apps-shared/secret-key-resolution";
import * as Sentry from "@sentry/nextjs";

import { env } from "@/env";
import { createDynamoDBClient, createDynamoDBDocumentClient } from "@/lib/dynamodb-client";

import { createMigrationScriptLogger } from "./migration-logger";

const {
  values: { "dry-run": dryRun },
} = parseArgs({
  options: {
    "dry-run": {
      type: "boolean",
      default: false,
    },
  },
});

const logger = createMigrationScriptLogger("RotateSecretKey");

Sentry.init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.ENV,
  includeLocalVariables: true,
  skipOpenTelemetrySetup: true,
  ignoreErrors: [],
  integrations: [],
});

const documentClient = createDynamoDBDocumentClient(
  createDynamoDBClient({ requestTimeout: 30_000, connectionTimeout: 10_000 }),
);

const runner = createDynamoDBSecretKeyRotationRunner({
  secretKey: resolveRotationTargetKey(env),
  fallbackKeys: resolveRotationSourceKeys(env),
  dryRun: dryRun ?? false,
  logger,
  documentClient,
  tableName: env.DYNAMODB_MAIN_TABLE_NAME,
  encryptedFieldNames: ["encryptedSegmentWriteKey"],
  decrypt,
  encrypt,
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
