import { describe, expect, it } from "vitest";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";

describe("BrokenAppResponse", () => {
  it("getResponse() returns valid Response with status 500 and message with error reason", async () => {
    const getConfigResponse = new BrokenAppResponse(new Error("Inner error"));
    const fetchResponse = getConfigResponse.getResponse();

    expect(fetchResponse.status).toBe(500);
    expect(await fetchResponse.json()).toMatchInlineSnapshot(`
      {
        "message": "App is not working",
      }
    `);
  });
});

describe("AppIsNotConfiguredResponse", () => {
  it("getResponse() returns valid Response with status 400 and message with error reason", async () => {
    const missingConfigResponse = new AppIsNotConfiguredResponse(new Error("Inner error"));
    const fetchResponse = missingConfigResponse.getResponse();

    expect(fetchResponse.status).toBe(400);
    expect(await fetchResponse.json()).toMatchInlineSnapshot(`
      {
        "message": "App is not configured",
      }
    `);
  });
});

describe("UnhandledErrorResponse", () => {
  it("getResponse() returns valid Response with status 500 and message with error reason", async () => {
    const unhandledResponse = new UnhandledErrorResponse(new Error("Inner error"));
    const fetchResponse = unhandledResponse.getResponse();

    expect(fetchResponse.status).toBe(500);
    expect(await fetchResponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Unhandled error",
      }
    `);
  });
});

describe("MalformedRequestResponse", () => {
  it("getResponse() returns valid Response with status 500 and message with error reason", async () => {
    const saleorApiUrlResponse = new MalformedRequestResponse(new Error("Inner error"));
    const fetchResponse = saleorApiUrlResponse.getResponse();

    expect(fetchResponse.status).toBe(500);
    expect(await fetchResponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Malformed request",
      }
    `);
  });
});
