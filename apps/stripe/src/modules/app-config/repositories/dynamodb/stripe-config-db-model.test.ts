import { Parser } from "dynamodb-toolbox";
import { describe, expect, it } from "vitest";

import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKeyTest } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";

import { DynamoDbStripeConfig } from "./stripe-config-db-model";

describe("DynamoDbStripeConfig", () => {
  const saleorApiUrl = mockedSaleorApiUrl;
  const appId = mockedSaleorAppId;
  const configId = mockedConfigurationId;

  describe("schema", () => {
    it("Properly parses data and doesn't throw", () => {
      const schema = DynamoDbStripeConfig.entitySchema;

      const result = schema.build(Parser).parse({
        PK: DynamoDbStripeConfig.accessPattern.getPK({ saleorApiUrl, appId }),
        SK: DynamoDbStripeConfig.accessPattern.getSKforSpecificItem({ configId }),
        configName: "name",
        configId: mockedConfigurationId,
        stripePk: mockedStripePublishableKey,
        stripeRk: mockedStripeRestrictedKeyTest,
        stripeWhSecret: mockStripeWebhookSecret,
        stripeWhId: "wh_123456789",
      });

      expect(result).toMatchInlineSnapshot(`
        {
          "PK": "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
          "SK": "CONFIG_ID#81f323bd-91e2-4838-ab6e-5affd81ffc3b",
          "configId": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
          "configName": "name",
          "stripePk": "pk_live_1",
          "stripeRk": "rk_test_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
          "stripeWhId": "wh_123456789",
          "stripeWhSecret": "whsec_XYZ",
        }
      `);
    });
  });
});
