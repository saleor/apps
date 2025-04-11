import { describe, expect, it } from "vitest";

import { mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { GetConfigError, MissingConfigError } from "@/modules/app-config/app-config-errors";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  GetConfigErrorResponse,
  MissingConfigErrorResponse,
  SaleorApiUrlCreateErrorResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";

describe("GetConfigErrorResponse", () => {
  it("should return fetch API response with status code and message", async () => {
    const error = new GetConfigError("Test error");
    const getConfigResponse = new GetConfigErrorResponse({ error });
    const fetchReponse = getConfigResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "App is not configured - error while getting config",
      }
    `);
  });
});

describe("MissingConfigErrorResponse", () => {
  it("should return fetch API response with status code and message", async () => {
    const error = new MissingConfigError("Test error", {
      props: { channelId: mockedSaleorChannelId },
    });
    const missingConfigResponse = new MissingConfigErrorResponse({ error });
    const fetchReponse = missingConfigResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "channelId": "Q2hhbm5lbDox",
        "message": "App is not configured - configuration is missing for channel",
      }
    `);
  });
});

describe("UnhandledErrorResponse", () => {
  it("should return fetch API response with status code and message", async () => {
    const error = new Error("Test error");
    const unhandledResponse = new UnhandledErrorResponse({ error });
    const fetchReponse = unhandledResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Unhandled error",
      }
    `);
  });
});

describe("SaleorApiUrlCreateErrorResponse", () => {
  it("should return fetch API response with status code and message", async () => {
    const error = new SaleorApiUrl.ValidationError("Test error");
    const saleorApiUrlResponse = new SaleorApiUrlCreateErrorResponse({ error });
    const fetchReponse = saleorApiUrlResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Saleor API URL is invalid",
      }
    `);
  });
});
