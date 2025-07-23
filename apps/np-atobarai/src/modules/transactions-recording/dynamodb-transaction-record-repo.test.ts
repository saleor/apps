import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it } from "vitest";

import { getMockedAppTransaction } from "@/__tests__/mocks/app-transaction/mocked-app-transaction";
import { mockedAtobaraiTransactionId } from "@/__tests__/mocks/atobarai/mocked-atobarai-transaction-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor/mocked-saleor-api-url";
import { mockedSaleorAppId } from "@/__tests__/mocks/saleor/mocked-saleor-app-id";

import { DynamoMainTable } from "../dynamodb/dynamodb-main-table";
import { TransactionRecordConfig } from "./dynamodb/entity";
import { DynamoDBTransactionRecordRepo } from "./dynamodb-transaction-record-repo";
import { TransactionRecord } from "./transaction-record";
import { TransactionRecordRepoError } from "./types";

describe("DynamoDBAppTransactionRepo", () => {
  let repo: DynamoDBTransactionRecordRepo;

  const mockDocumentClient = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    mockDocumentClient.reset();

    const table = DynamoMainTable.create({
      // @ts-expect-error mocking DynamoDBDocumentClient
      documentClient: mockDocumentClient,
      tableName: "np-atobarai-test-table",
    });

    const entity = TransactionRecordConfig.createEntity(table);

    repo = new DynamoDBTransactionRecordRepo({
      entity,
    });
  });

  describe("createTransaction", () => {
    it("calls DynamoDB with correct parameters", async () => {
      mockDocumentClient.on(PutCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 200,
        },
      });

      const result = await repo.createTransaction(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        getMockedAppTransaction(),
      );

      expect(result._unsafeUnwrap()).toBeNull();
    });

    it("return FailedCreatingTransactionError if call to DynamoDB ended with non-200 status", async () => {
      mockDocumentClient.on(PutCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 500,
        },
      });

      const result = await repo.createTransaction(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        getMockedAppTransaction(),
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        TransactionRecordRepoError.FailedWritingTransactionError,
      );
    });
  });

  describe("updateTransaction", () => {
    it("calls DynamoDB with correct parameters", async () => {
      mockDocumentClient.on(UpdateCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 200,
        },
      });

      const result = await repo.updateTransaction(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        getMockedAppTransaction(),
      );

      expect(result._unsafeUnwrap()).toBeNull();
    });

    it("returns FailedUpdatingTransactionError if call to DynamoDB ended with non-200 status", async () => {
      mockDocumentClient.on(UpdateCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 500,
        },
      });

      const result = await repo.updateTransaction(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        getMockedAppTransaction(),
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        TransactionRecordRepoError.FailedUpdatingTransactionError,
      );
    });
  });

  describe("getTransactionByAtobaraiTransactionId", () => {
    it("returns AppTransaction value object if found in DynamoDB", async () => {
      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: TransactionRecordConfig.accessPattern.getPK({
              saleorApiUrl: mockedSaleorApiUrl,
              appId: mockedSaleorAppId,
            }),
            SK: TransactionRecordConfig.accessPattern.getSKForSpecificItem({
              atobaraiTransactionId: mockedAtobaraiTransactionId,
            }),
          },
        })
        .resolvesOnce({
          Item: {
            PK: TransactionRecordConfig.accessPattern.getPK({
              saleorApiUrl: mockedSaleorApiUrl,
              appId: mockedSaleorAppId,
            }),
            SK: TransactionRecordConfig.accessPattern.getSKForSpecificItem({
              atobaraiTransactionId: mockedAtobaraiTransactionId,
            }),
            atobaraiTransactionId: mockedAtobaraiTransactionId,
            saleorTrackingNumber: null,
            createdAt: "2023-01-01T00:00:00.000Z",
            modifiedAt: "2023-01-01T00:00:00.000Z",
            _et: "AppTransaction",
          },
          $metadata: {
            httpStatusCode: 200,
          },
        });

      const result = await repo.getTransactionByAtobaraiTransactionId(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        mockedAtobaraiTransactionId,
      );

      expect(result._unsafeUnwrap()).toBeInstanceOf(TransactionRecord);
      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        TransactionRecord {
          "atobaraiTransactionId": "np_trans_id",
          "saleorTrackingNumber": null,
        }
      `);
    });

    it("return TransactionMissingError if item not found in DynamoDB", async () => {
      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: TransactionRecordConfig.accessPattern.getPK({
              saleorApiUrl: mockedSaleorApiUrl,
              appId: mockedSaleorAppId,
            }),
            SK: TransactionRecordConfig.accessPattern.getSKForSpecificItem({
              atobaraiTransactionId: mockedAtobaraiTransactionId,
            }),
          },
        })
        .resolvesOnce({
          $metadata: {
            httpStatusCode: 200,
          },
        });
      const result = await repo.getTransactionByAtobaraiTransactionId(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        mockedAtobaraiTransactionId,
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        TransactionRecordRepoError.TransactionMissingError,
      );
    });

    it("returns FailedGettingTransactionError if call to DynamoDB ended with non-200 status", async () => {
      mockDocumentClient.on(GetCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 500,
        },
      });

      const result = await repo.getTransactionByAtobaraiTransactionId(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        mockedAtobaraiTransactionId,
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        TransactionRecordRepoError.FailedFetchingTransactionError,
      );
    });
  });
});
