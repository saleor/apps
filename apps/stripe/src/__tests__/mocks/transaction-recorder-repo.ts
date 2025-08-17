import { ok } from "neverthrow";
import { vi } from "vitest";

import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { TransactionRecorderRepo } from "@/modules/transactions-recording/repositories/transaction-recorder-repo";

export const mockedTransactionRecorderRepo: TransactionRecorderRepo = {
  recordTransaction: vi.fn(() => Promise.resolve(ok(undefined))),
  getTransactionByStripePaymentIntentId: vi.fn(() =>
    Promise.resolve(
      ok(
        new RecordedTransaction({
          saleorTransactionId: "mocked-saleor-transaction-id" as any,
          stripePaymentIntentId: "mocked-stripe-payment-intent-id" as any,
          saleorTransactionFlow: "CHARGE",
          resolvedTransactionFlow: "CHARGE",
          selectedPaymentMethod: "card",
          stripeAccountId: undefined,
        }),
      ),
    ),
  ),
};

export const mockedTransactionRecorderRepoWithVendorAccount: TransactionRecorderRepo = {
  recordTransaction: vi.fn(() => Promise.resolve(ok(undefined))),
  getTransactionByStripePaymentIntentId: vi.fn(() =>
    Promise.resolve(
      ok(
        new RecordedTransaction({
          saleorTransactionId: "mocked-saleor-transaction-id" as any,
          stripePaymentIntentId: "mocked-stripe-payment-intent-id" as any,
          saleorTransactionFlow: "CHARGE",
          resolvedTransactionFlow: "CHARGE",
          selectedPaymentMethod: "card",
          stripeAccountId: "acct_vendor123",
        }),
      ),
    ),
  ),
};