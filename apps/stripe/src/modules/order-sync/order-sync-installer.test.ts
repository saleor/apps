import { createAppWebhook } from "@saleor/webhook-utils";
import { type Client } from "urql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { OrderSyncInstaller } from "./order-sync-installer";

vi.mock("@saleor/webhook-utils", () => ({ createAppWebhook: vi.fn() }));

const WEBHOOK_NAME = "Stripe Order Created";

const webhookManifest = {
  name: WEBHOOK_NAME,
  asyncEvents: ["ORDER_CREATED" as const],
  query: "subscription { event { __typename } }",
  targetUrl: "https://app.example.com/api/webhooks/saleor/order-created",
  isActive: true,
};

const createClient = (app: { permissions: string[]; webhooks: string[] }) => {
  const query = vi.fn(() => ({
    toPromise: async () => ({
      data: {
        app: {
          permissions: app.permissions.map((code) => ({ code })),
          webhooks: app.webhooks.map((name) => ({ name })),
        },
      },
    }),
  }));

  return { client: { query } as unknown as Client, query };
};

describe("OrderSyncInstaller", () => {
  let now = 0;
  const installer = () => new OrderSyncInstaller({ now: () => now });

  beforeEach(() => {
    vi.resetAllMocks();
    now = 0;
  });

  describe("getStatus", () => {
    it("Doesn't cache missing permission, so a just-granted permission is seen on next check", async () => {
      const instance = installer();
      const { client, query } = createClient({ permissions: ["HANDLE_PAYMENTS"], webhooks: [] });

      const args = { cacheKey: "key", client, webhookName: WEBHOOK_NAME };

      expect((await instance.getStatus(args))._unsafeUnwrap()).toStrictEqual({
        hasPermission: false,
        hasWebhook: false,
      });
      await instance.getStatus(args);

      expect(query).toHaveBeenCalledTimes(2);
    });

    it("Caches enabled status until TTL passes", async () => {
      const instance = installer();
      const { client, query } = createClient({
        permissions: ["HANDLE_PAYMENTS", "MANAGE_ORDERS"],
        webhooks: [WEBHOOK_NAME],
      });

      const args = { cacheKey: "key", client, webhookName: WEBHOOK_NAME };

      await instance.getStatus(args);
      expect((await instance.getStatus(args))._unsafeUnwrap()).toStrictEqual({
        hasPermission: true,
        hasWebhook: true,
      });
      expect(query).toHaveBeenCalledTimes(1);

      now = 60 * 60 * 1000 + 1;
      await instance.getStatus(args);

      expect(query).toHaveBeenCalledTimes(2);
    });
  });

  describe("enable", () => {
    it("Returns error and doesn't create webhook without permission", async () => {
      const { client } = createClient({ permissions: ["HANDLE_PAYMENTS"], webhooks: [] });

      const result = await installer().enable({ cacheKey: "key", client, webhookManifest });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderSyncInstaller.MissingPermissionError);
      expect(createAppWebhook).not.toHaveBeenCalled();
    });

    it("Creates webhook when permission is granted and caches enabled status", async () => {
      vi.mocked(createAppWebhook).mockResolvedValue(
        {} as Awaited<ReturnType<typeof createAppWebhook>>,
      );
      const instance = installer();
      const { client, query } = createClient({
        permissions: ["HANDLE_PAYMENTS", "MANAGE_ORDERS"],
        webhooks: [],
      });

      const result = await instance.enable({ cacheKey: "key", client, webhookManifest });

      expect(result._unsafeUnwrap()).toStrictEqual({ hasPermission: true, hasWebhook: true });
      expect(createAppWebhook).toHaveBeenCalledWith({
        client,
        input: {
          asyncEvents: ["ORDER_CREATED"],
          syncEvents: undefined,
          isActive: true,
          name: WEBHOOK_NAME,
          targetUrl: webhookManifest.targetUrl,
          query: webhookManifest.query,
        },
      });

      await instance.getStatus({ cacheKey: "key", client, webhookName: WEBHOOK_NAME });
      expect(query).toHaveBeenCalledTimes(1);
    });

    it("Doesn't create webhook twice", async () => {
      const { client } = createClient({
        permissions: ["MANAGE_ORDERS"],
        webhooks: [WEBHOOK_NAME],
      });

      const result = await installer().enable({ cacheKey: "key", client, webhookManifest });

      expect(result.isOk()).toBe(true);
      expect(createAppWebhook).not.toHaveBeenCalled();
    });

    it("Returns error when webhook creation fails", async () => {
      vi.mocked(createAppWebhook).mockRejectedValue(new Error("Saleor error"));
      const { client } = createClient({ permissions: ["MANAGE_ORDERS"], webhooks: [] });

      const result = await installer().enable({ cacheKey: "key", client, webhookManifest });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(OrderSyncInstaller.WebhookCreateError);
    });
  });
});
