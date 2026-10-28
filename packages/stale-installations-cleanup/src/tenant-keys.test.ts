import { BatchWriteCommand, type DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { describe, expect, it, vi } from "vitest";

import { deleteTenantKeys, scanTenantKeys, type TenantKey, type TenantTable } from "./tenant-keys";

const GONE = "https://gone.eu.saleor.cloud/graphql/";
const ALIVE = "https://alive.eu.saleor.cloud/graphql/";

const TABLE_ITEMS: TenantKey[] = [
  { PK: GONE, SK: "APL" },
  { PK: `${GONE}#app-id`, SK: "CONFIG" },
  { PK: `${GONE}#app-id`, SK: "TRANSACTION#1" },
  { PK: ALIVE, SK: "APL" },
  { PK: `${ALIVE}#app-id`, SK: "CONFIG" },
  { PK: "MCP#state#1", SK: "STATE" },
];

const createTable = ({ unprocessed = false } = {}) => {
  const deleted: TenantKey[] = [];
  const send = vi.fn(async (command: unknown) => {
    if (command instanceof ScanCommand) {
      // Two pages, to cover pagination.
      return command.input.ExclusiveStartKey
        ? { Items: TABLE_ITEMS.slice(3) }
        : { Items: TABLE_ITEMS.slice(0, 3), LastEvaluatedKey: { PK: "x", SK: "x" } };
    }

    if (command instanceof BatchWriteCommand) {
      const requests = command.input.RequestItems!.main!;

      if (unprocessed) {
        return { UnprocessedItems: { main: requests } };
      }

      deleted.push(...requests.map((request) => request.DeleteRequest!.Key as TenantKey));

      return {};
    }

    throw new Error("Unexpected command");
  });

  const table: TenantTable = {
    getName: () => "main",
    getDocumentClient: () => ({ send }) as unknown as DynamoDBDocumentClient,
  };

  return { table, deleted, send };
};

describe("scanTenantKeys", () => {
  it("Returns every key of the given tenants only", async () => {
    const { table } = createTable();

    const keys = await scanTenantKeys(table, [GONE]);

    expect(keys).toStrictEqual(new Map([[GONE, TABLE_ITEMS.slice(0, 3)]]));
  });

  it("Finds and deletes installation-scoped MCP policy and OAuth records through shared cleanup", async () => {
    const records = [
      "GROUP_POLICY",
      "OAUTH_GRANT#grant",
      "OAUTH_TRANSACTION#transaction",
      "OAUTH_CODE#hash",
      "OAUTH_ACCESS_TOKEN#hash",
      "OAUTH_REFRESH_TOKEN#hash",
      "OAUTH_UPGRADE#hash",
    ].map((SK) => ({ PK: `${GONE}#mcp-app`, SK }));
    const { table, send, deleted } = createTable();

    send.mockResolvedValueOnce({
      Items: [
        ...records,
        { PK: `${ALIVE}#mcp-app`, SK: "GROUP_POLICY" },
        { PK: "OAUTH_CLIENT", SK: "client" },
      ],
    });
    const keys = await scanTenantKeys(table, [GONE]);

    expect(keys.get(GONE)).toStrictEqual(records);
    expect(await deleteTenantKeys(table, GONE, keys.get(GONE)!)).toBe(0);
    expect(deleted).toStrictEqual(records);
  });

  it("Does not scan for no tenants", async () => {
    const { table, send } = createTable();

    expect(await scanTenantKeys(table, [])).toStrictEqual(new Map());
    expect(send).not.toHaveBeenCalled();
  });
});

describe("deleteTenantKeys", () => {
  it("Deletes the APL entry last", async () => {
    const { table, deleted } = createTable();

    const failed = await deleteTenantKeys(table, GONE, TABLE_ITEMS.slice(0, 3));

    expect(failed).toBe(0);
    expect(deleted).toStrictEqual([
      { PK: `${GONE}#app-id`, SK: "CONFIG" },
      { PK: `${GONE}#app-id`, SK: "TRANSACTION#1" },
      { PK: GONE, SK: "APL" },
    ]);
  });

  it("Keeps the APL entry when other items could not be deleted, so the next run retries", async () => {
    vi.useFakeTimers();

    const { table, send } = createTable({ unprocessed: true });
    const result = deleteTenantKeys(table, GONE, TABLE_ITEMS.slice(0, 3));

    await vi.runAllTimersAsync();

    expect(await result).toBe(3);
    expect(
      send.mock.calls.every(([command]) =>
        (command as BatchWriteCommand).input.RequestItems!.main!.every(
          (request) => request.DeleteRequest!.Key!.PK !== GONE,
        ),
      ),
    ).toBe(true);

    vi.useRealTimers();
  });
});
