import { BatchWriteCommand, type DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { afterEach, describe, expect, it, vi } from "vitest";

import { cleanupStaleInstallations } from "./cleanup-stale-installations";
import { type TenantTable } from "./tenant-keys";

vi.mock("@vercel/oidc", () => ({ getVercelOidcToken: vi.fn(async () => "oidc-token") }));

const ALIVE = "https://alive.eu.saleor.cloud/graphql/";
// More than fit in Vercel's 256 log lines per request when logged one per line.
const GONE = Array.from({ length: 300 }, (_, i) => `https://gone-${i}.eu.saleor.cloud/graphql/`);

const createTable = (events: string[] = []) => {
  const deleted: unknown[] = [];
  const send = vi.fn(async (command: unknown) => {
    if (command instanceof ScanCommand) {
      return { Items: [...GONE, ALIVE].map((PK) => ({ PK, SK: "APL" })) };
    }

    if (command instanceof BatchWriteCommand) {
      deleted.push(...command.input.RequestItems!.main!);
      events.push("table");

      return {};
    }

    throw new Error("Unexpected command");
  });

  const table: TenantTable = {
    getName: () => "main",
    getDocumentClient: () => ({ send }) as unknown as DynamoDBDocumentClient,
  };

  return { table, deleted };
};

const run = (
  dryRun: boolean,
  deleteAppData?: (installation: { saleorApiUrl: string; appId: string }) => Promise<void>,
) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: URL, init: RequestInit) => {
      const { domains } = JSON.parse(init.body as string) as { domains: string[] };

      return Response.json({
        data: domains.map((domain) => ({ domain, exists: domain === "alive.eu.saleor.cloud" })),
      });
    }),
  );

  const events: string[] = [];
  const { table, deleted } = createTable(events);
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const result = cleanupStaleInstallations({
    getInstallations: async () =>
      [...GONE, ALIVE].map((saleorApiUrl) => ({ saleorApiUrl, appId: "app-id" })),
    table,
    cloudApiUrl: "https://cloud.example.io/platform/api",
    oidcAudience: "aud",
    rootDomains: ["eu.saleor.cloud"],
    dryRun,
    logger,
    deleteAppData:
      deleteAppData &&
      (async (installation) => {
        events.push("app data");
        await deleteAppData(installation);
      }),
  });

  return { result, deleted, logger, events };
};

describe("cleanupStaleInstallations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Logs the summary first and stale installations in chunks, deleting nothing in dry run", async () => {
    const { result, deleted, logger } = run(true);
    const summary = { dryRun: true, checked: 301, skipped: 0, unknown: 0, stale: 300, items: 300 };

    expect(await result).toStrictEqual({
      status: 200,
      body: { ...summary, failedItems: 0, failedAppData: 0 },
    });
    expect(deleted).toStrictEqual([]);

    const messages = logger.info.mock.calls.map(([message]) => message);

    expect(messages).toStrictEqual([
      "Found stale installations",
      "Would delete stale installations data",
      "Would delete stale installations data",
      "Would delete stale installations data",
      "Stale installations cleanup finished",
    ]);
    expect(logger.info.mock.calls[0][1]).toStrictEqual(summary);
    expect(
      logger.info.mock.calls.slice(1, 4).flatMap(([, { installations }]) => installations),
    ).toStrictEqual(GONE.map((saleorApiUrl) => ({ saleorApiUrl, items: 1 })));
  });

  it("Deletes stale installations data", async () => {
    const { result, deleted } = run(false);

    expect((await result).body).toMatchObject({ stale: 300, items: 300, failedItems: 0 });
    expect(deleted).toHaveLength(300);
  });

  it("Deletes app data of each installation before its table items", async () => {
    const deleteAppData = vi.fn(async () => {});
    const { result, events } = run(false, deleteAppData);

    expect((await result).body).toMatchObject({ failedItems: 0, failedAppData: 0 });
    expect(deleteAppData).toHaveBeenCalledWith({ saleorApiUrl: GONE[0], appId: "app-id" });
    expect(events.slice(0, 4)).toStrictEqual(["app data", "table", "app data", "table"]);
  });

  it("Keeps an installation's table items, APL entry included, when deleting its app data fails", async () => {
    const { result, deleted, logger } = run(false, async ({ saleorApiUrl }) => {
      if (saleorApiUrl === GONE[0]) {
        throw new Error("Stripe is down");
      }
    });

    expect((await result).body).toMatchObject({ failedAppData: 1 });
    expect(deleted).toHaveLength(299);
    expect(deleted).not.toContainEqual({ DeleteRequest: { Key: { PK: GONE[0], SK: "APL" } } });
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("Failed to delete app data"), {
      installations: [{ saleorApiUrl: GONE[0], error: "Error: Stripe is down" }],
    });
  });

  it("Does not delete app data in dry run", async () => {
    const deleteAppData = vi.fn(async () => {});
    const { result } = run(true, deleteAppData);

    await result;

    expect(deleteAppData).not.toHaveBeenCalled();
  });

  it("Skips when not configured", async () => {
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const result = await cleanupStaleInstallations({
      getInstallations: async () => [],
      table: undefined,
      cloudApiUrl: "https://cloud.example.io/platform/api",
      oidcAudience: "aud",
      rootDomains: ["eu.saleor.cloud"],
      dryRun: true,
      logger,
    });

    expect(result.status).toBe(201);
    expect(logger.error).toHaveBeenCalledOnce();
  });
});
