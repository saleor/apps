import { describe, expect, it } from "vitest";

import { mockedSaleorAppId, mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { DynamoDBTransactionRecorderRepo } from "@/modules/transactions-recording/repositories/dynamodb/dynamodb-transaction-recorder-repo";

const otherSaleorApiUrl = createSaleorApiUrl("https://other.saleor.cloud/graphql/")._unsafeUnwrap();

const buildTx = (paymentIntentId: string) =>
  new RecordedTransaction({
    saleorTransactionId: mockedSaleorTransactionId,
    stripePaymentIntentId: createStripePaymentIntentId(paymentIntentId),
    saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
    resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
    selectedPaymentMethod: "card",
    saleorSchemaVersion: [3, 22],
  });

describe("TransactionRecorderRepo.removeAllForApp integration", () => {
  const repo = new DynamoDBTransactionRecorderRepo();

  it("removes every RecordedTransaction for the given tenant and leaves other tenants intact", async () => {
    const txA1 = buildTx("pi_tenantA_1");
    const txA2 = buildTx("pi_tenantA_2");
    const txB = buildTx("pi_tenantB_1");

    await repo.recordTransaction(
      { saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId },
      txA1,
    );
    await repo.recordTransaction(
      { saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId },
      txA2,
    );
    await repo.recordTransaction(
      { saleorApiUrl: otherSaleorApiUrl, appId: mockedSaleorAppId },
      txB,
    );

    const result = await repo.removeAllForApp({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(result.isOk()).toBe(true);

    const fetchedA1 = await repo.getTransactionByStripePaymentIntentId(
      { saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId },
      txA1.stripePaymentIntentId,
    );
    const fetchedA2 = await repo.getTransactionByStripePaymentIntentId(
      { saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId },
      txA2.stripePaymentIntentId,
    );
    const fetchedB = await repo.getTransactionByStripePaymentIntentId(
      { saleorApiUrl: otherSaleorApiUrl, appId: mockedSaleorAppId },
      txB.stripePaymentIntentId,
    );

    expect(fetchedA1.isErr()).toBe(true);
    expect(fetchedA2.isErr()).toBe(true);
    expect(fetchedB.isOk()).toBe(true);
    expect(fetchedB._unsafeUnwrap().stripePaymentIntentId).toStrictEqual(txB.stripePaymentIntentId);
  });

  it("is a no-op on an empty partition", async () => {
    const result = await repo.removeAllForApp({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(result.isOk()).toBe(true);
  });
});
