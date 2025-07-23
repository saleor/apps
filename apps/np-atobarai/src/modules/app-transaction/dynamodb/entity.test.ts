import { Parser } from "dynamodb-toolbox";
import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";

import { appTransactionSchema, getPK, getSKForSpecificItem } from "./entity";

describe("App Transaction Entity", () => {
  describe("getPK", () => {
    it("should return primary key scoped to installation", () => {
      const result = getPK({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      });

      expect(result).toBe(`${mockedSaleorApiUrl}#${mockedSaleorAppId}`);
    });
  });

  describe("getSKForSpecificItem", () => {
    it("should return sort key for specific transaction ID", () => {
      const result = getSKForSpecificItem({
        atobaraiTransactionId: mockedAtobaraiTransactionId,
      });

      expect(result).toBe(`TRANSACTION#${mockedAtobaraiTransactionId}`);
    });
  });

  describe("schema", () => {
    it("Properly parses data and doesn't throw", () => {
      const result = appTransactionSchema.build(Parser).parse({
        PK: getPK({
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        }),
        SK: getSKForSpecificItem({
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        }),
        atobaraiTransactionId: mockedAtobaraiTransactionId,
        saleorTrackingNumber: "123456789",
      });

      expect(result).toMatchInlineSnapshot(`
        {
          "PK": "https://mocked.saleor.api/graphql/#mocked-saleor-app-id",
          "SK": "TRANSACTION#np_trans_id",
          "atobaraiTransactionId": "np_trans_id",
          "saleorTrackingNumber": "123456789",
        }
      `);
    });
  });
});
