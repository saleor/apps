import { describe, expect, it } from "vitest";

import { mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";

describe("WebhookParams", () => {
  const validSearchParams = new URLSearchParams({
    [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl.url,
    [WebhookParams.channelIdSearchParam]: mockedSaleorChannelId,
  });

  const validUrl = new URL(
    "https://test-deployment.com?" + validSearchParams.toString(),
  ).toString();

  // Ensure testing entities are valid from human perspective
  it("Valid url is valid", () => {
    expect(validUrl).toMatchInlineSnapshot(
      `"https://test-deployment.com/?saleorApiUrl=https%3A%2F%2Ffoo.bar.saleor.cloud%2Fgraphql%2F&channelId=Q2hhbm5lbDox"`,
    );
  });

  // Ensure param names that are public contract are preserved by a test, if this changes, contract is broken
  it("Ensure public params are stable", () => {
    expect(WebhookParams.saleorApiUrlSearchParam).toStrictEqual("saleorApiUrl");
    expect(WebhookParams.channelIdSearchParam).toStrictEqual("channelId");
  });

  describe("working on saleorApiUrl", () => {
    it("Parses saleorApiUrl to the field", () => {
      const result = WebhookParams.createFromWebhookUrl(validUrl);

      const vo = result._unsafeUnwrap();

      expect(vo.saleorApiUrl).toStrictEqual(mockedSaleorApiUrl);
    });

    it("Throws if saleorApiUrl is missing", () => {
      const params = new URLSearchParams({
        [WebhookParams.channelIdSearchParam]: mockedSaleorChannelId,
      });

      const result = WebhookParams.createFromWebhookUrl(
        new URL("https://test-deployment.com?" + params.toString()).toString(),
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toMatchInlineSnapshot(`
      [ParsingError: Missing saleorApiUrl param
      Cant parse Stripe incoming webhook URL]
    `);
    });

    it("Throws if saleorApiUrl is malformed", () => {
      const params = new URLSearchParams({
        [WebhookParams.saleorApiUrlSearchParam]: "test",
        [WebhookParams.channelIdSearchParam]: mockedSaleorChannelId,
      });

      const result = WebhookParams.createFromWebhookUrl(
        new URL(`https://test-deployment.com?${params.toString()}`).toString(),
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toMatchInlineSnapshot(`
        [ParsingError: saleorApiUrl URL param is invalid
        Cant parse Stripe incoming webhook URL]
      `);
    });
  });

  describe("working on channelId", () => {
    it("Parses channelId to the field", () => {
      const result = WebhookParams.createFromWebhookUrl(validUrl);

      const vo = result._unsafeUnwrap();

      expect(vo.channelId).toStrictEqual(mockedSaleorChannelId);
    });

    it("Throws if channelId is missing", () => {
      const params = new URLSearchParams({
        [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl.url,
      });

      const result = WebhookParams.createFromWebhookUrl(
        new URL("https://test-deployment.com?" + params.toString()).toString(),
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toMatchInlineSnapshot(`
        [ParsingError: channelId URL param is invalid
        Cant parse Stripe incoming webhook URL]
      `);
    });

    it("Throws if channelId is malformed", () => {
      const params = new URLSearchParams({
        [WebhookParams.channelIdSearchParam]: "",
        [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl.url,
      });

      const result = WebhookParams.createFromWebhookUrl(
        new URL(`https://test-deployment.com?${params.toString()}`).toString(),
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toMatchInlineSnapshot(`
        [ParsingError: channelId URL param is invalid
        Cant parse Stripe incoming webhook URL]
      `);
    });
  });
});
