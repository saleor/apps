import { describe, expect, it } from "vitest";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { BaseError } from "@/lib/errors";

describe("BrokenAppResponse", () => {
  it("getResponse() returns valid Response with status 500 and message with error reason", async () => {
    const getConfigResponse = new BrokenAppResponse({ stripeEnv: null }, new Error("Inner error"));
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
    const missingConfigResponse = new AppIsNotConfiguredResponse(
      { stripeEnv: null },
      new Error("Inner error"),
    );
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
    const unhandledResponse = new UnhandledErrorResponse(
      { stripeEnv: null },
      new Error("Inner error"),
    );
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
    const saleorApiUrlResponse = new MalformedRequestResponse(
      { stripeEnv: null },
      new Error("Inner error"),
    );
    const fetchResponse = saleorApiUrlResponse.getResponse();

    expect(fetchResponse.status).toBe(500);
    expect(await fetchResponse.json()).toMatchInlineSnapshot(`
      {
        "message": "Malformed request",
      }
    `);
  });
});

describe("Passing error details to the response when Stripe env is TEST", () => {
  it.each([
    BrokenAppResponse,
    MalformedRequestResponse,
    UnhandledErrorResponse,
    AppIsNotConfiguredResponse,
  ])(`Response %s attaches error details to the message`, async (ErrorResponse) => {
    const ErrorInner = BaseError.subclass("RootError");
    const ErrorInner2 = BaseError.subclass("InnerError");
    const ErrorInner3 = BaseError.subclass("DeepestError");

    const error = new ErrorInner("Root", {
      cause: new ErrorInner2("Inner", {
        cause: new ErrorInner3("Deepest", {
          props: {
            someSecretValue: "123",
          },
        }),
      }),
    });

    const response = new ErrorResponse({ stripeEnv: "TEST" }, error);
    const body = (await response.getResponse().json()) as { message: string };

    // check if root message exists
    expect(body.message).toStrictEqual(expect.stringContaining(response.message));
    // check if merged errors exist
    expect(body.message).toStrictEqual(
      expect.stringContaining(`InnerError: DeepestError: Deepest
Inner
Root`),
    );
    // Ensure props on error are not attached
    expect(body.message).not.toStrictEqual(expect.stringContaining("someSecretValue"));
    expect(body.message).not.toStrictEqual(expect.stringContaining("123"));
  });
});
