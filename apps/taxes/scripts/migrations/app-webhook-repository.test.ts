import { Client } from "urql";
import { AppWebhookRepository } from "./app-webhook-repository";
import { expect, describe, it } from "vitest";
import { CreateAppWebhookMutationVariables } from "../../generated/graphql";

describe("AppWebhookRepository", () => {
  describe("getAll", () => {
    it("returns an empty array when error returned", async () => {
      const client = {
        query: () => ({
          toPromise: () => ({
            error: {
              message: "error",
            },
          }),
        }),
      } as unknown as Client;

      const appWebhookRepository = new AppWebhookRepository(client);

      expect(await appWebhookRepository.getAll()).toEqual([]);
    });
  });
  describe("delete", () => {
    it("throws error when error returned", async () => {
      const client = {
        mutation: () => ({
          toPromise: () => ({
            error: {
              message: "error",
            },
          }),
        }),
      } as unknown as Client;

      const appWebhookRepository = new AppWebhookRepository(client);

      await expect(appWebhookRepository.delete("id")).rejects.toThrow();
    });
  });
  describe("create", () => {
    it("throws error when error returned", async () => {
      const client = {
        mutation: () => ({
          toPromise: () => ({
            error: {
              message: "error",
            },
          }),
        }),
      } as unknown as Client;

      const appWebhookRepository = new AppWebhookRepository(client);

      await expect(
        appWebhookRepository.create({} as unknown as CreateAppWebhookMutationVariables)
      ).rejects.toThrow();
    });
  });
});
