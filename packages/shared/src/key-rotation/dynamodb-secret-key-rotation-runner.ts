import { type DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { type Logger } from "@saleor/apps-logger";

import { SecretKeyRotationRunner } from "./secret-key-rotation-runner";

async function* scanDynamoDBItems(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  logger: Pick<Logger, "info">,
): AsyncGenerator<Record<string, unknown>> {
  let lastEvaluatedKey: Record<string, unknown> | undefined;
  let pageCount = 0;

  do {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    pageCount++;
    logger.info(
      `Scanned page ${pageCount}: ${result.Items?.length ?? 0} items. LastEvaluatedKey: ${
        result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : "none (scan complete)"
      }`,
    );

    if (result.Items) {
      yield* result.Items as Record<string, unknown>[];
    }

    lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastEvaluatedKey);
}

interface DynamoDBSecretKeyRotationRunnerConfig {
  secretKey: string;
  fallbackKeys: string[];
  dryRun: boolean;
  logger: Pick<Logger, "info" | "error">;
  documentClient: DynamoDBDocumentClient;
  tableName: string;
  encryptedFieldNames: string[];
  decrypt: (encryptedValue: string, key: string) => string;
  encrypt: (plaintext: string, key: string) => string;
}

export const createDynamoDBSecretKeyRotationRunner = (
  config: DynamoDBSecretKeyRotationRunnerConfig,
) => {
  const { documentClient, tableName, encryptedFieldNames, logger, ...runnerConfig } = config;

  return new SecretKeyRotationRunner<Record<string, unknown>>({
    ...runnerConfig,
    logger,
    getItems: async function* () {
      for await (const item of scanDynamoDBItems(documentClient, tableName, logger)) {
        const encryptedFields = encryptedFieldNames
          .filter((name) => typeof item[name] === "string")
          .map((name) => ({ name, encryptedValue: item[name] as string }));

        if (encryptedFields.length === encryptedFieldNames.length) {
          yield {
            id: `${String(item.PK)}/${String(item.SK)}`,
            encryptedFields,
            original: item,
          };
        }
      }
    },
    saveItem: async (rotated) => {
      await documentClient.send(
        new PutCommand({
          TableName: tableName,
          Item: { ...rotated.original, ...rotated.reEncryptedFields },
        }),
      );
    },
  });
};
