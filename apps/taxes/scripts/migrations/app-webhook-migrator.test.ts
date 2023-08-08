import { SaleorAsyncWebhook, SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { describe, it, vitest, expect } from "vitest";
import { AppWebhookMigrator } from "./app-webhook-migrator";
import { AppWebhookRepository } from "./app-webhook-repository";

describe("AppWebhookMigrator", () => {
  describe("migrateWebhook", () => {
    describe("in report mode", () => {
      it("does not call create", async () => {
        const createMock = vitest.fn();
        const appWebhookRepository = {
          create: createMock,
          getAll: () => [],
        } as unknown as AppWebhookRepository;

        const appWebhookMigrator = new AppWebhookMigrator(
          {
            appWebhookRepository,
            apiUrl: "apiUrl",
            appId: "appId",
          },
          { mode: "report" }
        );

        await appWebhookMigrator.migrateWebhook("OrderCreated", {} as SaleorAsyncWebhook);

        expect(createMock).not.toHaveBeenCalled();
      });
      it("does not call delete", async () => {
        const deleteMock = vitest.fn();
        const appWebhookRepository = {
          delete: deleteMock,
          getAll: () => [],
        } as unknown as AppWebhookRepository;

        const appWebhookMigrator = new AppWebhookMigrator(
          {
            appWebhookRepository,
            apiUrl: "apiUrl",
            appId: "appId",
          },
          { mode: "report" }
        );

        await appWebhookMigrator.migrateWebhook("OrderCreated", {} as SaleorAsyncWebhook);

        expect(deleteMock).not.toHaveBeenCalled();
      });
    });
    describe("in migrate mode", () => {
      it("calls create", async () => {
        const createMock = vitest.fn();
        const appWebhookRepository = {
          create: createMock,
          getAll: () => [],
        } as unknown as AppWebhookRepository;

        const appWebhookMigrator = new AppWebhookMigrator(
          {
            appWebhookRepository,
            apiUrl: "apiUrl",
            appId: "appId",
          },
          { mode: "migrate" }
        );

        const webhookHandler = {
          getWebhookManifest: () => {
            return {
              name: "OrderCreated",
              targetUrl: `targetUrl`,
              query: "query",
              asyncEvents: ["OrderCreated"],
            };
          },
        } as unknown as SaleorAsyncWebhook;

        await appWebhookMigrator.migrateWebhook("OrderCreated", webhookHandler);

        expect(createMock).toHaveBeenCalled();
      });
      it("calls delete", async () => {
        const deleteMock = vitest.fn();
        const appWebhookRepository = {
          create: () => {},
          getAll: () => [
            {
              id: "id",
              name: "OrderCreated",
              targetUrl: `targetUrl`,
              query: "query",
              asyncEvents: ["OrderCreated"],
            },
          ],
          delete: deleteMock,
        } as unknown as AppWebhookRepository;

        const appWebhookMigrator = new AppWebhookMigrator(
          {
            appWebhookRepository,
            apiUrl: "apiUrl",
            appId: "appId",
          },
          { mode: "migrate" }
        );

        const webhookHandler = {
          getWebhookManifest: () => {
            return {
              name: "OrderCreated",
              targetUrl: `targetUrl`,
              query: "query",
              asyncEvents: ["OrderCreated"],
            };
          },
        } as unknown as SaleorAsyncWebhook;

        await appWebhookMigrator.migrateWebhook("OrderCreated", webhookHandler);

        expect(deleteMock).toHaveBeenCalled();
      });
    });
  });
  describe("rollbackWebhookMigrations", () => {
    describe("in report mode", () => {
      it("does not call delete", async () => {
        const deleteMock = vitest.fn();
        const appWebhookRepository = {
          delete: deleteMock,
          getAll: () => [],
        } as unknown as AppWebhookRepository;

        const appWebhookMigrator = new AppWebhookMigrator(
          {
            appWebhookRepository,
            apiUrl: "apiUrl",
            appId: "appId",
          },
          { mode: "report" }
        );

        await appWebhookMigrator.rollbackWebhookMigrations([{} as unknown as SaleorSyncWebhook]);

        expect(deleteMock).not.toHaveBeenCalled();
      });
    });
    describe("in migrate mode", () => {
      it("calls delete for a matched webhook", async () => {
        const deleteMock = vitest.fn();
        const appWebhookRepository = {
          delete: deleteMock,
          getAll: () => [
            {
              id: "id-1234",
              name: "OrderCreated",
            },
            {
              id: "id",
              name: "OrderUpdated",
            },
          ],
        } as unknown as AppWebhookRepository;

        const appWebhookMigrator = new AppWebhookMigrator(
          {
            appWebhookRepository,
            apiUrl: "apiUrl",
            appId: "appId",
          },
          { mode: "migrate" }
        );

        await appWebhookMigrator.rollbackWebhookMigrations([
          {
            name: "OrderCreated",
            targetUrl: `targetUrl`,
            query: "query",
            events: ["OrderCreated"],
          },
        ] as unknown as SaleorSyncWebhook[]);

        expect(deleteMock).toHaveBeenCalledWith("id-1234");
      });
    });
  });
});
