import { type APL } from "@saleor/app-sdk/APL";
import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";
import { type Logger } from "@saleor/apps-logger";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppDeletedDocument } from "../generated/graphql";
import { createAppDeletedHandler } from "./app-deleted-handler";

vi.mock("@saleor/app-sdk/handlers/next-app-router", () => ({
  SaleorAsyncWebhook: vi.fn(),
}));

type InnerHandler = (req: unknown, ctx: unknown) => Promise<Response>;

describe("createAppDeletedHandler", () => {
  const saleorApiUrl = "https://example.saleor.cloud/graphql/";
  const webhookPath = "api/webhooks/app-deleted";

  let aplDelete: ReturnType<typeof vi.fn>;
  let apl: APL;
  let logger: Logger;
  let getWebhookManifestMock: ReturnType<typeof vi.fn>;

  const buildCtx = () => ({
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

  beforeEach(() => {
    aplDelete = vi.fn().mockResolvedValue(undefined);
    apl = { delete: aplDelete } as unknown as APL;
    logger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;
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
          createHandler: (fn: InnerHandler) => fn,
          getWebhookManifest: getWebhookManifestMock,
        }) as unknown as SaleorAsyncWebhook,
    );
  });

  it("registers the webhook with APP_DELETED event and provided webhookPath", () => {
    createAppDeletedHandler({ apl, logger, webhookPath });

    expect(SaleorAsyncWebhook).toHaveBeenCalledWith({
      apl,
      name: "APP_DELETED",
      query: AppDeletedDocument,
      event: "APP_DELETED",
      isActive: true,
      webhookPath,
    });
  });

  it("exposes getWebhookManifest from the underlying webhook", () => {
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

  describe("handler", () => {
    it("returns 200 and deletes auth data for the saleorApiUrl from the context", async () => {
      const { handler } = createAppDeletedHandler({ apl, logger, webhookPath });

      const response = await (handler as InnerHandler)({}, buildCtx());

      expect(response.status).toBe(200);
      expect(aplDelete).toHaveBeenCalledWith(saleorApiUrl);
    });

    it("logs an info message that auth data is about to be removed", async () => {
      const { handler } = createAppDeletedHandler({ apl, logger, webhookPath });

      await (handler as InnerHandler)({}, buildCtx());

      expect(logger.info).toHaveBeenCalledWith(
        "APP_DELETED event received. Auth Data will be removed",
      );
    });

    it("returns 500 when apl.delete rejects", async () => {
      aplDelete.mockRejectedValueOnce(new Error("DB connection lost"));

      const { handler } = createAppDeletedHandler({ apl, logger, webhookPath });

      const response = await (handler as InnerHandler)({}, buildCtx());

      expect(response.status).toBe(500);
      await expect(response.text()).resolves.toBe("Failed to clean up auth data.");
    });

    it("logs the error when apl.delete rejects", async () => {
      const error = new Error("DB connection lost");

      aplDelete.mockRejectedValueOnce(error);

      const { handler } = createAppDeletedHandler({ apl, logger, webhookPath });

      await (handler as InnerHandler)({}, buildCtx());

      expect(logger.error).toHaveBeenCalledWith("Error deleting auth data on APP_DELETED", {
        error,
      });
    });

    describe("hooks", () => {
      it("invokes onEvent hook with the webhook context", async () => {
        const onEvent = vi.fn().mockResolvedValue(undefined);
        const { handler } = createAppDeletedHandler({
          apl,
          logger,
          webhookPath,
          hooks: { onEvent },
        });
        const ctx = buildCtx();

        await (handler as InnerHandler)({}, ctx);

        expect(onEvent).toHaveBeenCalledWith(ctx);
      });

      it("invokes onAuthDataDeleted hook after apl.delete succeeds", async () => {
        const onAuthDataDeleted = vi.fn().mockResolvedValue(undefined);
        const { handler } = createAppDeletedHandler({
          apl,
          logger,
          webhookPath,
          hooks: { onAuthDataDeleted },
        });

        await (handler as InnerHandler)({}, buildCtx());

        expect(onAuthDataDeleted).toHaveBeenCalled();
        expect(aplDelete.mock.invocationCallOrder[0]).toBeLessThan(
          onAuthDataDeleted.mock.invocationCallOrder[0],
        );
      });

      it("does not invoke onAuthDataDeleted hook when apl.delete fails", async () => {
        aplDelete.mockRejectedValueOnce(new Error("failed"));
        const onAuthDataDeleted = vi.fn().mockResolvedValue(undefined);
        const { handler } = createAppDeletedHandler({
          apl,
          logger,
          webhookPath,
          hooks: { onAuthDataDeleted },
        });

        await (handler as InnerHandler)({}, buildCtx());

        expect(onAuthDataDeleted).not.toHaveBeenCalled();
      });

      it("invokes onAuthDataDeleteError hook with the thrown error when apl.delete fails", async () => {
        const error = new Error("DB connection lost");

        aplDelete.mockRejectedValueOnce(error);
        const onAuthDataDeleteError = vi.fn().mockResolvedValue(undefined);
        const { handler } = createAppDeletedHandler({
          apl,
          logger,
          webhookPath,
          hooks: { onAuthDataDeleteError },
        });

        await (handler as InnerHandler)({}, buildCtx());

        expect(onAuthDataDeleteError).toHaveBeenCalledWith(error);
      });

      it("does not invoke onAuthDataDeleteError hook when apl.delete succeeds", async () => {
        const onAuthDataDeleteError = vi.fn().mockResolvedValue(undefined);
        const { handler } = createAppDeletedHandler({
          apl,
          logger,
          webhookPath,
          hooks: { onAuthDataDeleteError },
        });

        await (handler as InnerHandler)({}, buildCtx());

        expect(onAuthDataDeleteError).not.toHaveBeenCalled();
      });

      /**
       * The handler contract is documented to silently drop errors from hooks.
       * Hooks must own their own error handling. These tests prove that contract.
       */
      it("silently drops errors thrown by onEvent hook and still returns 200", async () => {
        const onEvent = vi.fn().mockRejectedValue(new Error("onEvent boom"));
        const { handler } = createAppDeletedHandler({
          apl,
          logger,
          webhookPath,
          hooks: { onEvent },
        });

        const response = await (handler as InnerHandler)({}, buildCtx());

        expect(response.status).toBe(200);
        expect(aplDelete).toHaveBeenCalledWith(saleorApiUrl);
      });

      it("silently drops errors thrown by onAuthDataDeleted hook and still returns 200", async () => {
        const onAuthDataDeleted = vi.fn().mockRejectedValue(new Error("onAuthDataDeleted boom"));
        const { handler } = createAppDeletedHandler({
          apl,
          logger,
          webhookPath,
          hooks: { onAuthDataDeleted },
        });

        const response = await (handler as InnerHandler)({}, buildCtx());

        expect(response.status).toBe(200);
      });

      it("silently drops errors thrown by onAuthDataDeleteError hook and still returns 500", async () => {
        aplDelete.mockRejectedValueOnce(new Error("DB connection lost"));
        const onAuthDataDeleteError = vi
          .fn()
          .mockRejectedValue(new Error("onAuthDataDeleteError boom"));
        const { handler } = createAppDeletedHandler({
          apl,
          logger,
          webhookPath,
          hooks: { onAuthDataDeleteError },
        });

        const response = await (handler as InnerHandler)({}, buildCtx());

        expect(response.status).toBe(500);
        expect(onAuthDataDeleteError).toHaveBeenCalled();
      });
    });
  });
});
