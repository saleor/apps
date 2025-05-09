import { describe, expect, it } from "vitest";

import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";

describe("WebhookParams", () => {
  const validSearchParams = new URLSearchParams({
    [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl,
    [WebhookParams.configurationIdIdSearchParam]: mockedConfigurationId,
    [WebhookParams.appIdSearchParam]: mockedSaleorAppId,
  });

  const validUrl = new URL(
    "https://test-deployment.com?" + validSearchParams.toString(),
  ).toString();

  // Ensure testing entities are valid from human perspective
  it("Valid url is valid", () => {
    expect(validUrl).toMatchInlineSnapshot(
      `"https://test-deployment.com/?saleorApiUrl=https%3A%2F%2Ffoo.bar.saleor.cloud%2Fgraphql%2F&configurationId=81f323bd-91e2-4838-ab6e-5affd81ffc3b&appId=saleor-app-id"`,
    );
  });

  // Ensure param names that are public contract are preserved by a test, if this changes, contract is broken
  it("Ensure public params are stable", () => {
    expect(WebhookParams.saleorApiUrlSearchParam).toStrictEqual("saleorApiUrl");
    expect(WebhookParams.configurationIdIdSearchParam).toStrictEqual("configurationId");
  });

  describe("working on saleorApiUrl", () => {
    it("Parses saleorApiUrl to the field", () => {
      const result = WebhookParams.createFromWebhookUrl(validUrl);

      const vo = result._unsafeUnwrap();

      expect(vo.saleorApiUrl).toStrictEqual(mockedSaleorApiUrl);
    });

    it("Throws if saleorApiUrl is missing", () => {
      const params = new URLSearchParams({
        [WebhookParams.configurationIdIdSearchParam]: mockedConfigurationId,
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
        [WebhookParams.configurationIdIdSearchParam]: mockedConfigurationId,
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

  describe("working on configurationId", () => {
    it("Parses configurationId to the field", () => {
      const result = WebhookParams.createFromWebhookUrl(validUrl);

      const vo = result._unsafeUnwrap();

      expect(vo.configurationId).toStrictEqual(mockedConfigurationId);
    });

    it("Throws if configurationId is missing", () => {
      const params = new URLSearchParams({
        [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl,
      });

      const result = WebhookParams.createFromWebhookUrl(
        new URL("https://test-deployment.com?" + params.toString()).toString(),
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toMatchInlineSnapshot(`
        [ParsingError: configurationId URL param is invalid
        Cant parse Stripe incoming webhook URL]
      `);
    });

    it("Throws if configurationId is malformed", () => {
      const params = new URLSearchParams({
        [WebhookParams.configurationIdIdSearchParam]: "",
        [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl,
      });

      const result = WebhookParams.createFromWebhookUrl(
        new URL(`https://test-deployment.com?${params.toString()}`).toString(),
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toMatchInlineSnapshot(`
        [ParsingError: configurationId URL param is invalid
        Cant parse Stripe incoming webhook URL]
      `);
    });
  });

  describe("working on appId", () => {
    it("Parses appId to the field", () => {
      const result = WebhookParams.createFromWebhookUrl(validUrl);

      const vo = result._unsafeUnwrap();

      expect(vo.appId).toStrictEqual(mockedSaleorAppId);
    });

    it("Throws if appId is missing", () => {
      const params = new URLSearchParams({
        [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl,
        [WebhookParams.configurationIdIdSearchParam]: mockedConfigurationId,
      });

      const result = WebhookParams.createFromWebhookUrl(
        new URL("https://test-deployment.com?" + params.toString()).toString(),
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toMatchInlineSnapshot(`
        [ParsingError: appId URL param is invalid
        Cant parse Stripe incoming webhook URL]
      `);
    });

    it("Throws if appId is malformed", () => {
      const params = new URLSearchParams({
        [WebhookParams.configurationIdIdSearchParam]: mockedConfigurationId,
        [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl,
        [WebhookParams.appIdSearchParam]: "",
      });

      const result = WebhookParams.createFromWebhookUrl(
        new URL(`https://test-deployment.com?${params.toString()}`).toString(),
      );

      const error = result._unsafeUnwrapErr();

      expect(error).toMatchInlineSnapshot(`
        [ParsingError: appId URL param is invalid
        Cant parse Stripe incoming webhook URL]
      `);
    });
  });
});
