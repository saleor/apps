import { describe, expect, it, vi } from "vitest";
import { appConfigurationRouter } from "./app-configuration-router";
import { getMockAddress } from "../../fixtures/mock-address";
import { mockMetadataManager } from "./__mocks__/metadata-manager";

vi.mock("./metadata-manager");

vi.mock("../../saleor-app", () => {
  const apl = {
    async get() {
      return {
        appId: "app",
        saleorApiUrl: "http://localhost:8000/graphql/",
        token: "TOKEN",
        domain: "localhost:8000",
      };
    },
    async set() {},
    async delete() {},
    async getAll() {
      return [];
    },
    async isReady() {
      return {
        ready: true,
      };
    },
    async isConfigured() {
      return {
        configured: true,
      };
    },
  };

  return {
    saleorApp: {
      apl,
    },
  };
});

vi.mock("@saleor/app-sdk/verify-jwt", () => {
  return {
    verifyJWT: vi.fn().mockImplementation((async) => {}),
  };
});

describe("appConfigurationRouter", function () {
  describe("upsertChannelOverride", function () {
    it("Calls metadata manager with proper value to save", async () => {
      await appConfigurationRouter
        .createCaller({
          token: "TOKEN",
          saleorApiUrl: "http://localhost:8000/graphql/",
          appId: "app",
          ssr: true,
          baseUrl: "localhost:3000",
        })
        .upsertChannelOverride({
          channelSlug: "test",
          address: getMockAddress(),
        });

      expect(mockMetadataManager.set).toHaveBeenCalledWith({
        key: "app-config-v2",
        value: expect.any(String),
      });
    });
  });
});
