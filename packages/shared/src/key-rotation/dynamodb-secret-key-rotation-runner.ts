import { type DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { type Logger } from "@saleor/apps-logger";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";

import {
  ItemConcurrentlyModifiedError,
  SecretKeyRotationRunner,
} from "./secret-key-rotation-runner";

/**
 * All app DynamoDB tables in this monorepo scope PKs as `${saleorApiUrl}#${appId}`.
 * saleorApiUrl is a URL containing no `#` character, so splitting on the first
 * `#` recovers it cleanly.
 */
const extractSaleorApiUrlFromPK = (pk: unknown): string | undefined => {
  if (typeof pk !== "string") return undefined;
  const hashIndex = pk.indexOf("#");

  return hashIndex === -1 ? undefined : pk.slice(0, hashIndex);
};

const PK_ALIAS = "#pk";
const SK_ALIAS = "#sk";
const fieldNameAlias = (index: number) => `#f${index}`;
const newValuePlaceholder = (index: number) => `:new${index}`;
const oldValuePlaceholder = (index: number) => `:old${index}`;

const buildProjectionExpression = (encryptedFieldNames: string[]) => {
  const names: Record<string, string> = {
    [PK_ALIAS]: "PK",
    [SK_ALIAS]: "SK",
  };

  encryptedFieldNames.forEach((name, index) => {
    names[fieldNameAlias(index)] = name;
  });

  const projection = [PK_ALIAS, SK_ALIAS, ...encryptedFieldNames.map((_, i) => fieldNameAlias(i))];

  return {
    ProjectionExpression: projection.join(", "),
    ExpressionAttributeNames: names,
  };
};

interface ScanDynamoDBItemsParams {
  documentClient: DynamoDBDocumentClient;
  tableName: string;
  encryptedFieldNames: string[];
  logger: Pick<Logger, "info">;
}

async function* scanDynamoDBItems({
  documentClient,
  tableName,
  encryptedFieldNames,
  logger,
}: ScanDynamoDBItemsParams): AsyncGenerator<Record<string, unknown>> {
  const { ProjectionExpression, ExpressionAttributeNames } =
    buildProjectionExpression(encryptedFieldNames);

  let lastEvaluatedKey: Record<string, unknown> | undefined;
  let pageCount = 0;

  do {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
        ConsistentRead: true,
        ProjectionExpression,
        ExpressionAttributeNames,
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
      for await (const item of scanDynamoDBItems({
        documentClient,
        tableName,
        encryptedFieldNames,
        logger,
      })) {
        const encryptedFields = encryptedFieldNames
          .filter((name) => typeof item[name] === "string")
          .map((name) => ({ name, encryptedValue: item[name] as string }));

        if (encryptedFields.length === encryptedFieldNames.length) {
          const saleorApiUrl = extractSaleorApiUrlFromPK(item.PK);

          yield {
            id: `${String(item.PK)}/${String(item.SK)}`,
            encryptedFields,
            original: item,
            logAttributes: saleorApiUrl
              ? { [ObservabilityAttributes.SALEOR_API_URL]: saleorApiUrl }
              : undefined,
          };
        }
      }
    },
    saveItem: async (rotated) => {
      const fieldEntries = Object.entries(rotated.reEncryptedFields);

      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, string> = {};
      const setClauses: string[] = [];
      const conditionClauses: string[] = [];

      fieldEntries.forEach(([name, newValue], index) => {
        const alias = fieldNameAlias(index);
        const newPlaceholder = newValuePlaceholder(index);
        const oldPlaceholder = oldValuePlaceholder(index);

        expressionAttributeNames[alias] = name;
        expressionAttributeValues[newPlaceholder] = newValue;
        expressionAttributeValues[oldPlaceholder] = rotated.original[name] as string;

        setClauses.push(`${alias} = ${newPlaceholder}`);
        conditionClauses.push(`${alias} = ${oldPlaceholder}`);
      });

      try {
        await documentClient.send(
          new UpdateCommand({
            TableName: tableName,
            Key: { PK: rotated.original.PK, SK: rotated.original.SK },
            UpdateExpression: `SET ${setClauses.join(", ")}`,
            ConditionExpression: conditionClauses.join(" AND "),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
          }),
        );
      } catch (error) {
        if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
          throw new ItemConcurrentlyModifiedError(
            `Item ${rotated.id} was modified by another writer between scan and update`,
          );
        }

        throw error;
      }
    },
  });
};
