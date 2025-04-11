import { describe, expect, it } from "vitest";

import {
  GetConfigErrorResponse,
  MissingConfigErrorResponse,
  SaleorApiUrlCreateErrorResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";

describe("GetConfigErrorResponse", () => {
  it("should return fetch API response with status code and message", async () => {
    const getConfigResponse = new GetConfigErrorResponse();
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
    const missingConfigResponse = new MissingConfigErrorResponse();
    const fetchReponse = missingConfigResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "App is not working",
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
    const saleorApiUrlResponse = new SaleorApiUrlCreateErrorResponse();
    const fetchReponse = saleorApiUrlResponse.getResponse();

    expect(fetchReponse.status).toBe(500);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Malformed request",
      }
    `);
  });
});
