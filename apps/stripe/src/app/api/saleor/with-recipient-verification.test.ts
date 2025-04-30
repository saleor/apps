import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { withRecipientVerification } from "@/app/api/saleor/with-recipient-verification";

describe("withRecipientVerification", () => {
  it("Calls handler if AuthData id matches payload recipient id", async () => {
    expect.assertions(2);

    const handler = withRecipientVerification((_req, ctx) => {
      expect(ctx.authData.appId).toStrictEqual(mockedSaleorAppId);

      return new Response("OK");
    });

    const response = await handler(new NextRequest("https://example.com"), {
      authData: mockAuthData,
      event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
      payload: {
        recipient: {
          id: mockedSaleorAppId,
        },
      },
      baseUrl: "https://example-app.com",
      schemaVersion: [3, 20],
    });

    expect(await response.text()).toStrictEqual("OK");
  });

  it("Returns 403 if AuthData id does not match recipient id", async () => {
    const handler = withRecipientVerification((_req, ctx) => {
      expect(ctx.authData.appId).toStrictEqual(mockedSaleorAppId);

      return new Response("OK");
    });

    const response = await handler(new NextRequest("https://example.com"), {
      authData: mockAuthData,
      event: "PAYMENT_GATEWAY_INITIALIZE_SESSION",
      payload: {
        recipient: {
          id: "another-id",
        },
      },
      baseUrl: "https://example-app.com",
      schemaVersion: [3, 20],
    });

    expect(await response.text()).toStrictEqual("Recipient ID does not match auth data ID");
    expect(await response.status).toStrictEqual(403);
  });
});
