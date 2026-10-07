import { type AuthData } from "@saleor/app-sdk/APL";
import { err, ok } from "neverthrow";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type Client } from "urql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAppDeprecationCronHandler } from "./create-app-deprecation-cron-handler";
import { declareAppDeprecation } from "./declare-app-deprecation";

vi.mock("./declare-app-deprecation", () => ({ declareAppDeprecation: vi.fn() }));

const REASON = "Replaced by another app.";

const authData = (saleorApiUrl: string) =>
  ({ saleorApiUrl, token: "token", appId: "app-id" }) as AuthData;

const createHandler = (installations: AuthData[]) =>
  createAppDeprecationCronHandler({
    cronSecret: "secret",
    apl: { getAll: vi.fn(async () => installations) },
    createClient: () => ({}) as Client,
    reason: REASON,
    logger: { info: vi.fn(), warn: vi.fn() },
    parallelCalls: 5,
    requestTimeoutMs: 1000,
  });

const call = async (handler: ReturnType<typeof createHandler>, authorization?: string) => {
  const json = vi.fn((_body: unknown) => undefined);
  const status = vi.fn((_code: number) => ({ json }));

  await handler(
    { headers: authorization ? { authorization } : {} } as NextApiRequest,
    { status } as unknown as NextApiResponse,
  );

  return { status: status.mock.calls[0]?.[0], body: json.mock.calls[0]?.[0] };
};

describe("createAppDeprecationCronHandler", () => {
  beforeEach(() => {
    vi.mocked(declareAppDeprecation).mockReset();
    vi.mocked(declareAppDeprecation).mockResolvedValue(ok("updated"));
  });

  it("Refuses an unauthorized caller without touching any installation", async () => {
    const handler = createHandler([authData("https://a.example.com/graphql/")]);

    expect((await call(handler)).status).toBe(401);
    expect(declareAppDeprecation).not.toHaveBeenCalled();
  });

  it("Declares deprecation on every installation, across chunk boundaries", async () => {
    const handler = createHandler(
      Array.from({ length: 12 }, (_, i) => authData(`https://shop-${i}.example.com/graphql/`)),
    );

    const response = await call(handler, "Bearer secret");

    expect(response).toStrictEqual({
      status: 200,
      body: { total: 12, failed: 0, skipped: 0, gone: 0 },
    });
    expect(declareAppDeprecation).toHaveBeenCalledTimes(12);
    expect(vi.mocked(declareAppDeprecation).mock.calls[0][1]).toBe(REASON);
  });

  /*
   * One unreachable tenant must not end the sweep; one below 3.23 is skipped and one that no
   * longer exists is gone, neither failed.
   */
  it("Finishes the sweep, counting failed, skipped and gone installations separately", async () => {
    const handler = createHandler([
      authData("https://down.example.com/graphql/"),
      authData("https://old.example.com/graphql/"),
      authData("https://deleted.example.com/graphql/"),
      authData("https://new.example.com/graphql/"),
    ]);

    vi.mocked(declareAppDeprecation)
      .mockResolvedValueOnce(err(new Error("Saleor is down")) as never)
      .mockResolvedValueOnce(ok("unsupported"))
      .mockResolvedValueOnce(ok("gone"))
      .mockResolvedValueOnce(ok("updated"));

    const response = await call(handler, "Bearer secret");

    expect(response).toStrictEqual({
      status: 200,
      body: { total: 4, failed: 1, skipped: 1, gone: 1 },
    });
  });

  /* A slow tenant occupies one worker; the others keep going instead of waiting for it. */
  it("Does not hold up other installations while one is slow", async () => {
    let releaseSlow: () => void = () => undefined;
    let inFlight = 0;
    let maxInFlight = 0;

    vi.mocked(declareAppDeprecation).mockImplementation(async (_client, _reason) => {
      const isFirst = vi.mocked(declareAppDeprecation).mock.calls.length === 1;

      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await (isFirst ? new Promise<void>((resolve) => (releaseSlow = resolve)) : Promise.resolve());
      inFlight -= 1;

      return ok("updated");
    });

    const handler = createHandler(
      Array.from({ length: 12 }, (_, i) => authData(`https://shop-${i}.example.com/graphql/`)),
    );

    const response = call(handler, "Bearer secret");

    await vi.waitFor(() => expect(declareAppDeprecation).toHaveBeenCalledTimes(12));
    releaseSlow();

    expect((await response).body).toStrictEqual({ total: 12, failed: 0, skipped: 0, gone: 0 });
    expect(maxInFlight).toBeLessThanOrEqual(5);
  });
});
