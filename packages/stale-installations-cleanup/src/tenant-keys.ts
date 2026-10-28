import { BatchWriteCommand, type DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

/** The table the app's DynamoAPL writes to, e.g. its dynamodb-toolbox `Table`. */
export type TenantTable = { getName(): string; getDocumentClient(): DynamoDBDocumentClient };

export type TenantKey = { PK: string; SK: string };

/** Limit of DynamoDB BatchWriteItem. */
const DELETE_BATCH_SIZE = 25;
const DELETE_MAX_ATTEMPTS = 5;

/**
 * Keys of every item of the given tenants. A tenant's items live under `PK = saleorApiUrl` (APL)
 * or `PK = saleorApiUrl#...` (installation scoped data), so tenant = PK up to the first `#`.
 *
 * ponytail: full-table key scan held in memory, scan per page if tables outgrow the function's
 * memory / max duration.
 */
export const scanTenantKeys = async (
  table: TenantTable,
  saleorApiUrls: string[],
): Promise<Map<string, TenantKey[]>> => {
  const tenants = new Set(saleorApiUrls);
  const keysByTenant = new Map<string, TenantKey[]>();
  let exclusiveStartKey: Record<string, unknown> | undefined;

  if (tenants.size === 0) {
    return keysByTenant;
  }

  do {
    const page = await table.getDocumentClient().send(
      new ScanCommand({
        TableName: table.getName(),
        ProjectionExpression: "#pk, #sk",
        ExpressionAttributeNames: { "#pk": "PK", "#sk": "SK" },
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    for (const item of (page.Items ?? []) as TenantKey[]) {
      const tenant = item.PK.split("#")[0];

      if (tenants.has(tenant)) {
        const keys = keysByTenant.get(tenant) ?? [];

        keys.push(item);
        keysByTenant.set(tenant, keys);
      }
    }

    exclusiveStartKey = page.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return keysByTenant;
};

/** Returns how many keys could not be deleted. */
const deleteKeys = async (table: TenantTable, keys: TenantKey[]): Promise<number> => {
  let failed = 0;

  for (let i = 0; i < keys.length; i += DELETE_BATCH_SIZE) {
    let requests = keys
      .slice(i, i + DELETE_BATCH_SIZE)
      .map(({ PK, SK }) => ({ DeleteRequest: { Key: { PK, SK } } }));

    for (let attempt = 1; requests.length > 0 && attempt <= DELETE_MAX_ATTEMPTS; attempt++) {
      if (attempt > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt));
      }

      const result = await table
        .getDocumentClient()
        .send(new BatchWriteCommand({ RequestItems: { [table.getName()]: requests } }));

      requests = (result.UnprocessedItems?.[table.getName()] ?? []) as typeof requests;
    }

    failed += requests.length;
  }

  return failed;
};

/**
 * Deletes a tenant's keys, the APL partition (`PK = saleorApiUrl`) last and only once everything
 * else is gone: keeping the APL entry lets the next run find the tenant and retry.
 *
 * Returns how many keys are left undeleted.
 */
export const deleteTenantKeys = async (
  table: TenantTable,
  saleorApiUrl: string,
  keys: TenantKey[],
): Promise<number> => {
  const aplPartition = keys.filter(({ PK }) => PK === saleorApiUrl);
  const failed = await deleteKeys(
    table,
    keys.filter(({ PK }) => PK !== saleorApiUrl),
  );

  return failed > 0 ? failed + aplPartition.length : deleteKeys(table, aplPartition);
};
