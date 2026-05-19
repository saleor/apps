import { type APL } from "@saleor/app-sdk/APL";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";
import { type WebhookContext } from "@saleor/app-sdk/handlers/shared";
import { type Logger } from "@saleor/apps-logger";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BaseError } from "../errors";
import {
  _innerAppDeletedHandler,
  createAppDeletedHandler,
} from "./app-deleted-handler";

vi.mock("@saleor/app-sdk/handlers/next-app-router", () => ({
  SaleorAsyncWebhook: vi.fn(),
}));

const saleorApiUrl = "https://example.saleor.cloud/graphql/";
const webhookPath = "api/webhooks/app-deleted";

const buildCtx = (): WebhookContext<unknown> => ({
  baseUrl: "https://example.saleor.cloud",
  event: "APP_DELETED",
  payload: {},
  authData: {
    saleorApiUrl,
    token: "token",
    appId: "app-id",
  },
  schemaVersion: null,
});

const buildLogger = () =>
  ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }) as unknown as Logger;



describe("_innerAppDeletedHandler", () => {
  let aplDelete: ReturnType<typeof vi.fn>;
  let apl: APL;
  let logger: Logger;

  beforeEach(() => {
    aplDelete = vi.fn().mockResolvedValue(undefined);
    apl = { delete: aplDelete } as unknown as APL;
    logger = buildLogger();
  });

  it("returns 200 and deletes auth data for the saleorApiUrl from the context", async () => {
    const response = await _innerAppDeletedHandler({ apl, logger, webhookPath }, buildCtx());

    expect(response.status).toBe(200);
    expect(aplDelete).toHaveBeenCalledWith(saleorApiUrl);
  });



  it("returns 500 when apl.delete rejects", async () => {
    aplDelete.mockRejectedValueOnce(new Error("DB connection lost"));

    const response = await _innerAppDeletedHandler({ apl, logger, webhookPath }, buildCtx());

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("Failed to clean up auth data.");
  });


  describe("hooks", () => {
    it("invokes onEvent hook with the webhook context", async () => {
      const onEvent = vi.fn().mockResolvedValue(undefined);
      const ctx = buildCtx();

      await _innerAppDeletedHandler({ apl, logger, webhookPath, hooks: { onEvent } }, ctx);

      expect(onEvent).toHaveBeenCalledWith(ctx);
    });

    it("invokes onAuthDataDeleted hook after apl.delete succeeds", async () => {
      const onAuthDataDeleted = vi.fn().mockResolvedValue(undefined);

      await _innerAppDeletedHandler(
        { apl, logger, webhookPath, hooks: { onAuthDataDeleted } },
        buildCtx(),
      );

      expect(onAuthDataDeleted).toHaveBeenCalled();
      expect(aplDelete.mock.invocationCallOrder[0]).toBeLessThan(
        onAuthDataDeleted.mock.invocationCallOrder[0],
      );
    });

    it("does not invoke onAuthDataDeleted hook when apl.delete fails", async () => {
      aplDelete.mockRejectedValueOnce(new Error("failed"));
      const onAuthDataDeleted = vi.fn().mockResolvedValue(undefined);

      await _innerAppDeletedHandler(
        { apl, logger, webhookPath, hooks: { onAuthDataDeleted } },
        buildCtx(),
      );

      expect(onAuthDataDeleted).not.toHaveBeenCalled();
    });

    it("invokes onAuthDataDeleteError hook with a BaseError-normalized error when apl.delete fails", async () => {
      aplDelete.mockRejectedValueOnce(new Error("DB connection lost"));
      const onAuthDataDeleteError = vi.fn().mockResolvedValue(undefined);

      await _innerAppDeletedHandler(
        { apl, logger, webhookPath, hooks: { onAuthDataDeleteError } },
        buildCtx(),
      );

      expect(onAuthDataDeleteError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "DB connection lost" }),
      );
      expect(onAuthDataDeleteError.mock.calls[0][0]).toBeInstanceOf(BaseError);
    });

    it("does not invoke onAuthDataDeleteError hook when apl.delete succeeds", async () => {
      const onAuthDataDeleteError = vi.fn().mockResolvedValue(undefined);

      await _innerAppDeletedHandler(
        { apl, logger, webhookPath, hooks: { onAuthDataDeleteError } },
        buildCtx(),
      );

      expect(onAuthDataDeleteError).not.toHaveBeenCalled();
    });

    /**
     * The handler contract is documented to silently drop errors from hooks.
     * Hooks must own their own error handling. These tests prove that contract.
     */
    it("silently drops errors thrown by onEvent hook and still returns 200", async () => {
      const onEvent = vi.fn().mockRejectedValue(new Error("onEvent boom"));

      const response = await _innerAppDeletedHandler(
        { apl, logger, webhookPath, hooks: { onEvent } },
        buildCtx(),
      );

      expect(response.status).toBe(200);
      expect(aplDelete).toHaveBeenCalledWith(saleorApiUrl);
    });

    it("silently drops errors thrown by onAuthDataDeleted hook and still returns 200", async () => {
      const onAuthDataDeleted = vi.fn().mockRejectedValue(new Error("onAuthDataDeleted boom"));

      const response = await _innerAppDeletedHandler(
        { apl, logger, webhookPath, hooks: { onAuthDataDeleted } },
        buildCtx(),
      );

      expect(response.status).toBe(200);
    });

    it("silently drops errors thrown by onAuthDataDeleteError hook and still returns 500", async () => {
      aplDelete.mockRejectedValueOnce(new Error("DB connection lost"));
      const onAuthDataDeleteError = vi
        .fn()
        .mockRejectedValue(new Error("onAuthDataDeleteError boom"));

      const response = await _innerAppDeletedHandler(
        { apl, logger, webhookPath, hooks: { onAuthDataDeleteError } },
        buildCtx(),
      );

      expect(response.status).toBe(500);
      expect(onAuthDataDeleteError).toHaveBeenCalled();
    });
  });
});

describe("createAppDeletedHandler", () => {
  let apl: APL;
  let logger: Logger;
  let getWebhookManifestMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    apl = { delete: vi.fn().mockResolvedValue(undefined) } as unknown as APL;
    logger = buildLogger();
    getWebhookManifestMock = vi.fn().mockReturnValue({
      name: "APP_DELETED",
      asyncEvents: ["APP_DELETED"],
      query: "subscription AppDeleted { event { ... on AppDeleted { app { id } } } }",
      targetUrl: "https://example.saleor.cloud/api/webhooks/app-deleted",
      isActive: true,
    });

    vi.mocked(SaleorAsyncWebhook).mockImplementation(
      () =>
        ({
          createHandler: (fn: unknown) => fn,
          getWebhookManifest: getWebhookManifestMock,
        }) as unknown as SaleorAsyncWebhook,
    );
  });

  it("exposes getWebhookManifest from the underlying webhook with the full manifest shape", () => {
    const { getWebhookManifest } = createAppDeletedHandler({ apl, logger, webhookPath });

    const result = getWebhookManifest("https://example.saleor.cloud");

    expect(getWebhookManifestMock).toHaveBeenCalledWith("https://example.saleor.cloud");
    expect(result).toStrictEqual({
      name: "APP_DELETED",
      asyncEvents: ["APP_DELETED"],
      query: "subscription AppDeleted { event { ... on AppDeleted { app { id } } } }",
      targetUrl: "https://example.saleor.cloud/api/webhooks/app-deleted",
      isActive: true,
    });
  });

  it("returns a handler that runs the inner handler and deletes auth data", async () => {
    const { handler } = createAppDeletedHandler({ apl, logger, webhookPath });

    const response = await (
      handler as unknown as (req: unknown, ctx: WebhookContext<unknown>) => Promise<Response>
    )({}, buildCtx());

    expect(response.status).toBe(200);
    expect(apl.delete).toHaveBeenCalledWith(saleorApiUrl);
  });
});
