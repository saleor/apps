import { ok } from "neverthrow";
import { vi } from "vitest";

import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

export const mockedTransactionRecorderRepo: TransactionRecorderRepo = {
  recordTransaction: vi.fn(() => Promise.resolve(ok(null))),
  getTransactionByStripePaymentIntentId: vi.fn(() =>
    Promise.resolve(
      ok(
        new RecordedTransaction({
          saleorTransactionId: createSaleorTransactionId("mocked-saleor-transaction-id"),
          stripePaymentIntentId: createStripePaymentIntentId("pi_TEST_TEST_TEST"),
          saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
          resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
          selectedPaymentMethod: "card",
          stripeAccountId: undefined,
        }),
      ),
    ),
  ),
};

export const mockedTransactionRecorderRepoWithVendorAccount: TransactionRecorderRepo = {
  recordTransaction: vi.fn(() => Promise.resolve(ok(null))),
  getTransactionByStripePaymentIntentId: vi.fn(() =>
    Promise.resolve(
      ok(
        new RecordedTransaction({
          saleorTransactionId: createSaleorTransactionId("mocked-saleor-transaction-id"),
          stripePaymentIntentId: createStripePaymentIntentId("pi_TEST_TEST_TEST"),
          saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
          resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
          selectedPaymentMethod: "card",
          stripeAccountId: "acct_vendor123",
        }),
      ),
    ),
  ),
};
