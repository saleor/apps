import { describe, expect, it } from "vitest";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";

describe("GetConfigErrorResponse", () => {
  it("getResponse() returns valid Response with status 500 and message with error reason", async () => {
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
  it("getResponse() returns valid Response with status 400 and message with error reason", async () => {
    const missingConfigResponse = new AppIsNotConfiguredResponse();
    const fetchReponse = missingConfigResponse.getResponse();

    expect(fetchReponse.status).toBe(400);
    expect(await fetchReponse.json()).toMatchInlineSnapshot(`
      {
        "message": "App is not configured",
      }
    `);
  });
});

describe("UnhandledErrorResponse", () => {
  it("getResponse() returns valid Response with status 500 and message with error reason", async () => {
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

describe("MalformedRequestResponse", () => {
  it("getResponse() returns valid Response with status 500 and message with error reason", async () => {
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
