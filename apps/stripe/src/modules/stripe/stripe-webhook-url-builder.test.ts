import { describe, expect, it } from "vitest";

import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { StripeWebhookUrlBuilder } from "@/modules/stripe/stripe-webhook-url-builder";

describe("StripeWebhookUrlBuilder", () => {
  describe("buildUrl method", () => {
    it("Builds valid url from provided app origin and params", () => {
      const webhookParams = WebhookParams.createFromParams({
        saleorApiUrl: mockedSaleorApiUrl,
        configurationId: mockedConfigurationId,
        appId: mockedSaleorAppId,
      });

      const urlBuilder = new StripeWebhookUrlBuilder();

      const result = urlBuilder.buildUrl({
        webhookParams,
        appUrl: "http://localhost:3000",
      });

      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(
        `"http://localhost:3000/api/stripe/webhook?configurationId=81f323bd-91e2-4838-ab6e-5affd81ffc3b&saleorApiUrl=https%3A%2F%2Ffoo.bar.saleor.cloud%2Fgraphql%2F&appId=saleor-app-id"`,
      );

      /**
       * Use WebhookParams to parse back URL and compare if they are valid
       */
      const parsedParams = WebhookParams.createFromWebhookUrl(
        result._unsafeUnwrap(),
      )._unsafeUnwrap();

      expect(parsedParams.saleorApiUrl).toStrictEqual(mockedSaleorApiUrl);
      expect(parsedParams.configurationId).toStrictEqual(mockedConfigurationId);
    });
  });
});
