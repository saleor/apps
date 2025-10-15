import { Parser } from "dynamodb-toolbox";
import { describe, expect, it } from "vitest";

import { mockedSaleorAppId, mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockAuthData } from "@/__tests__/mocks/mock-auth-data";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { DynamoDbRecordedTransaction } from "@/modules/transactions-recording/repositories/dynamodb/recorded-transaction-db-model";

describe("DynamoDbRecordedTransaction", () => {
  describe("accessPattern", () => {
    it("getPK returns correct key with saleorApiUrl and appId", () => {
      expect(DynamoDbRecordedTransaction.accessPattern.getPK(mockAuthData)).toStrictEqual(
        "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
      );
    });
    it("getSKforSpecificItem returns correct key including Stripe PI ID", () => {
      expect(
        DynamoDbRecordedTransaction.accessPattern.getSKforSpecificItem({
          paymentIntentId: mockedStripePaymentIntentId,
        }),
      ).toStrictEqual(`TRANSACTION#${mockedStripePaymentIntentId}`);
    });
  });

  describe("schema", () => {
    it("Properly validates raw data and throws if invalid", () => {
      const parser = DynamoDbRecordedTransaction.entitySchema.build(Parser);

      expect(() =>
        parser.parse({
          PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
          SK: `TRANSACTION#${mockedSaleorTransactionId}`,
          saleorTransactionId: mockedSaleorTransactionId,
          saleorTransactionFlow: "AUTHORIZATION",
          resolvedTransactionFlow: "CHARGE",
          selectedPaymentMethod: "card",
          saleorSchemaVersion: { major: 3, minor: 20 },
        }),
      ).toThrowErrorMatchingInlineSnapshot(`[Error: Attribute 'paymentIntentId' is required.]`);

      expect(
        parser.parse({
          PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
          SK: `TRANSACTION#${mockedSaleorTransactionId}`,
          paymentIntentId: mockedStripePaymentIntentId,
          saleorTransactionId: mockedSaleorTransactionId,
          saleorTransactionFlow: "AUTHORIZATION",
          resolvedTransactionFlow: "CHARGE",
          selectedPaymentMethod: "card",
          saleorSchemaVersion: { major: 3, minor: 20 },
        }),
      ).toMatchInlineSnapshot(`
        {
          "PK": "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
          "SK": "TRANSACTION#mocked-transaction-id",
          "paymentIntentId": "pi_TEST_TEST_TEST",
          "resolvedTransactionFlow": "CHARGE",
          "saleorSchemaVersion": {
            "major": 3,
            "minor": 20,
          },
          "saleorTransactionFlow": "AUTHORIZATION",
          "saleorTransactionId": "mocked-transaction-id",
          "selectedPaymentMethod": "card",
        }
      `);
    });
  });
});
