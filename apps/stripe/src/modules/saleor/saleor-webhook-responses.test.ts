import { describe, expect, it } from "vitest";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";

describe("GetConfigErrorResponse", () => {
  it("should return fetch API response with status code and message", async () => {
    const getConfigResponse = new BrokenAppResponse();
    const fetchReponse = getConfigResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "App is not working",
      }
    `);
  });
});

describe("MissingConfigErrorResponse", () => {
  it("should return fetch API response with status code and message", async () => {
    const missingConfigResponse = new AppIsNotConfiguredResponse();
    const fetchReponse = missingConfigResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "App is not configured",
      }
    `);
  });
});

describe("UnhandledErrorResponse", () => {
  it("should return fetch API response with status code and message", async () => {
    const unhandledResponse = new UnhandledErrorResponse();
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
    const saleorApiUrlResponse = new MalformedRequestResponse();
    const fetchReponse = saleorApiUrlResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Malformed request",
      }
    `);
  });
});
