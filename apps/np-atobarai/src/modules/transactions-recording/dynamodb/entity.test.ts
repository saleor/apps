import { Parser } from "dynamodb-toolbox";
import { describe, expect, it } from "vitest";

import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";

import { TransactionRecordConfig } from "./entity";

describe("TransactionRecordConfig", () => {
  describe("accessPattern.getPK", () => {
    it("should return primary key scoped to installation", () => {
      const result = TransactionRecordConfig.accessPattern.getPK({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      });

      expect(result).toBe(`${mockedSaleorApiUrl}#${mockedSaleorAppId}`);
    });
  });

  describe("accessPattern.getSKForSpecificItem", () => {
    it("should return sort key for specific transaction ID", () => {
      const result = TransactionRecordConfig.accessPattern.getSKForSpecificItem({
        atobaraiTransactionId: mockedAtobaraiTransactionId,
      });

      expect(result).toBe(`TRANSACTION#${mockedAtobaraiTransactionId}`);
    });
  });

  describe("entitySchema", () => {
    it("Properly parses data and doesn't throw", () => {
      const result = TransactionRecordConfig.entitySchema.build(Parser).parse({
        PK: TransactionRecordConfig.accessPattern.getPK({
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        }),
        SK: TransactionRecordConfig.accessPattern.getSKForSpecificItem({
          atobaraiTransactionId: mockedAtobaraiTransactionId,
        }),
        atobaraiTransactionId: mockedAtobaraiTransactionId,
        saleorTrackingNumber: "123456789",
        saleorMetadataShippingCompanyCode: "59080",
      });

      expect(result).toMatchInlineSnapshot(`
        {
          "PK": "https://mocked.saleor.api/graphql/#mocked-saleor-app-id",
          "SK": "TRANSACTION#np_trans_id",
          "atobaraiTransactionId": "np_trans_id",
          "saleorMetadataShippingCompanyCode": "59080",
          "saleorTrackingNumber": "123456789",
        }
      `);
    });
  });
});
