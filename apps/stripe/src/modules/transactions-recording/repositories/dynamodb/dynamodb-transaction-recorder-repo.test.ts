import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it } from "vitest";

import { mockedSaleorAppId, mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { getMockedRecordedTransaction } from "@/__tests__/mocks/mocked-recorded-transaction";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { DynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { DynamoDBTransactionRecorderRepo } from "@/modules/transactions-recording/repositories/dynamodb/dynamodb-transaction-recorder-repo";
import { DynamoDbRecordedTransaction } from "@/modules/transactions-recording/repositories/dynamodb/recorded-transaction-db-model";
import { TransactionRecorderError } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

describe("DynamoDBTransactionRecorderRepo", () => {
  let repo: DynamoDBTransactionRecorderRepo;

  const mockDocumentClient = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    mockDocumentClient.reset();

    const table = DynamoMainTable.create({
      // @ts-expect-error mocking DynamoDBDocumentClient
      documentClient: mockDocumentClient,
      tableName: "stripe-test-table",
    });

    const entity = DynamoDbRecordedTransaction.createEntity(table);

    repo = new DynamoDBTransactionRecorderRepo({
      entity,
    });
  });
  describe("recordTransaction", () => {
    it("Calls dynamoDB with correct parameters", async () => {
      mockDocumentClient.on(PutCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 200,
        },
      });

      const result = await repo.recordTransaction(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        getMockedRecordedTransaction(),
      );

      expect(result._unsafeUnwrap()).toBeNull();
    });

    it("Returns FailedWritingTransactionError if call to DynamoDB ended with non-200 status", async () => {
      mockDocumentClient.on(PutCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 500,
        },
      });

      const result = await repo.recordTransaction(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        getMockedRecordedTransaction(),
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        TransactionRecorderError.FailedWritingTransactionError,
      );
    });

    it("Returns success when transaction already exists (idempotency - handles race condition from users calling mutations)", async () => {
      mockDocumentClient.on(PutCommand, {}).rejectsOnce(
        new ConditionalCheckFailedException({
          message: "The conditional request failed",
          $metadata: {},
        }),
      );

      const result = await repo.recordTransaction(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        getMockedRecordedTransaction(),
      );

      // Should return success, not error - the desired state already exists
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeNull();
    });
  });

  describe("getTransactionByStripePaymentIntentId", () => {
    it("Returns RecordedTransaction value object if found in DynamoDB", async () => {
      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
            SK: "TRANSACTION#pi_TEST_TEST_TEST",
          },
        })
        .resolvesOnce({
          Item: {
            PK: "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
            SK: "TRANSACTION#pi_TEST_TEST_TEST",
            paymentIntentId: mockedStripePaymentIntentId,
            saleorTransactionId: mockedSaleorTransactionId,
            saleorTransactionFlow: "CHARGE",
            resolvedTransactionFlow: "CHARGE",
            selectedPaymentMethod: "card",
            saleorSchemaVersion: { major: 3, minor: 22 },
            createdAt: "2023-01-01T00:00:00.000Z",
            modifiedAt: "2023-01-01T00:00:00.000Z",
            saleorApiUrl: mockedSaleorApiUrl,
            appId: mockedSaleorAppId,
            _et: "RecordedTransaction",
          },
          $metadata: {
            httpStatusCode: 200,
          },
        });

      const result = await repo.getTransactionByStripePaymentIntentId(
        {
          appId: mockedSaleorAppId,
          saleorApiUrl: mockedSaleorApiUrl,
        },
        mockedStripePaymentIntentId,
      );

      expect(result._unsafeUnwrap()).toBeInstanceOf(RecordedTransaction);
      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        RecordedTransaction {
          "resolvedTransactionFlow": "CHARGE",
          "saleorSchemaVersion": [
            3,
            22,
          ],
          "saleorTransactionFlow": "CHARGE",
          "saleorTransactionId": "mocked-transaction-id",
          "selectedPaymentMethod": "card",
          "stripePaymentIntentId": "pi_TEST_TEST_TEST",
        }
      `);
    });

    it("Returns TransactionMissingError if item not found in DynamoDB", async () => {
      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
            SK: "TRANSACTION#pi_TEST_TEST_TEST",
          },
        })
        .resolvesOnce({
          $metadata: {
            httpStatusCode: 200,
          },
        });

      const result = await repo.getTransactionByStripePaymentIntentId(
        {
          appId: mockedSaleorAppId,
          saleorApiUrl: mockedSaleorApiUrl,
        },
        mockedStripePaymentIntentId,
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        TransactionRecorderError.TransactionMissingError,
      );
    });

    it("Returns FailedFetchingTransactionError if DynamoDB call ended with non-200 status", async () => {
      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
            SK: "TRANSACTION#pi_TEST_TEST_TEST",
          },
        })
        .resolvesOnce({
          $metadata: {
            httpStatusCode: 500,
          },
        });

      const result = await repo.getTransactionByStripePaymentIntentId(
        {
          appId: mockedSaleorAppId,
          saleorApiUrl: mockedSaleorApiUrl,
        },
        mockedStripePaymentIntentId,
      );

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        TransactionRecorderError.FailedFetchingTransactionError,
      );
    });
  });
});
