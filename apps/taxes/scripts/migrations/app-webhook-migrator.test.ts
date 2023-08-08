import { SaleorAsyncWebhook, SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { describe, it, vitest, expect } from "vitest";
import { AppWebhookMigrator } from "./app-webhook-migrator";
import { AppWebhookRepository } from "./app-webhook-repository";

describe("AppWebhookMigrator", () => {
  describe("registerWebhookIfItDoesntExist", () => {
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

        await appWebhookMigrator.registerWebhookIfItDoesntExist({} as SaleorAsyncWebhook);

        expect(createMock).not.toHaveBeenCalled();
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

        await appWebhookMigrator.registerWebhookIfItDoesntExist(webhookHandler);

        expect(createMock).toHaveBeenCalled();
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

        await appWebhookMigrator.rollbackWebhookMigrations(
          "OrderCreated",
          {} as unknown as SaleorSyncWebhook
        );

        expect(deleteMock).not.toHaveBeenCalled();
      });
    });
    describe("in migrate mode", async () => {
      const deleteMock = vitest.fn();
      const enableMock = vitest.fn();
      const appWebhookRepository = {
        delete: deleteMock,
        enable: enableMock,
        getAll: () => [
          {
            id: "id-1234",
            name: "OrderConfirmed",
          },

          {
            id: "id-5678",
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

      await appWebhookMigrator.rollbackWebhookMigrations("OrderCreated", {
        name: "OrderConfirmed",
        targetUrl: `targetUrl`,
        query: "query",
        events: ["OrderConfirmed"],
      } as unknown as SaleorSyncWebhook);

      it("calls delete with the id that matches the handler", async () => {
        expect(deleteMock).toHaveBeenCalledWith("id-1234");
      });

      it("calls enable with the id that matches the name of the previous webhook", async () => {
        expect(enableMock).toHaveBeenCalledWith("id-5678");
      });
    });
  });
  describe("DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME", () => {
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

        await appWebhookMigrator.DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME("OrderCreated");

        expect(deleteMock).not.toHaveBeenCalled();
      });
    });
    describe("in migrate mode", () => {
      it("calls delete", async () => {
        const deleteMock = vitest.fn();
        const appWebhookRepository = {
          delete: deleteMock,
          getAll: () => [
            {
              name: "OrderCreated",
              id: "id-1234",
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

        await appWebhookMigrator.DANGEROUS_DELETE_APP_WEBHOOK_BY_NAME("OrderCreated");

        expect(deleteMock).toHaveBeenCalledWith("id-1234");
      });
    });
  });
});
