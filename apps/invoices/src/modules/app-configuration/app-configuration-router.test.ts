import { describe, expect, it, vi } from "vitest";
import { appConfigurationRouter } from "./app-configuration-router";

import { SaleorApp } from "@saleor/app-sdk/saleor-app";

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

// todo __mocks__ dont work
describe.skip("appConfigurationRouter", function () {
  it("works", async () => {
    const resp = await appConfigurationRouter
      .createCaller({
        token: "TOKEN",
        saleorApiUrl: "http://localhost:8000/graphql/",
        appId: "app",
      })
      .fetchChannelsOverrides();

    console.log(resp);

    expect(resp).toEqual({});
  });
});
