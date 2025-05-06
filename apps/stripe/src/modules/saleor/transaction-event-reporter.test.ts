import { describe, expect, it, vi } from "vitest";

import { mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { TransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";
import { generateStripeDashboardUrl } from "@/modules/stripe/generate-stripe-dashboard-url";

describe("TransactionEventReporter", () => {
  const instance = new TransactionEventReporter({
    graphqlClient: mockedGraphqlClient,
  });

  it("Returns AlreadyReportedError if graphql error points ALREADY_EXISTS", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        transactionEventReport: {
          errors: [
            {
              code: "ALREADY_EXISTS",
              message: "Transaction with this pspReference already exists",
            },
          ],
        },
      },
    }));

    const result = await instance.reportTransactionEvent({
      time: new Date().toISOString(),
      message: "Test message",
      type: "AUTHORIZATION_ADJUSTMENT",
      amount: SaleorMoney.createFromStripe({
        amount: 10_12,
        currency: "USD",
      })._unsafeUnwrap(),
      pspReference: mockedStripePaymentIntentId,
      transactionId: mockedSaleorTransactionId,
      actions: [],
      externalReference: generateStripeDashboardUrl(mockedStripePaymentIntentId, "LIVE"),
    });

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
      `
      [TransactionEventReporter.AlreadyReportedError: Transaction with this pspReference already exists
      Event already reported]
    `,
    );
  });

  it("Returns AlreadyReportedError if data contains alreadyProcessed: true", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        transactionEventReport: {
          alreadyProcessed: true,
          transactionEvent: {
            id: "asd",
          },
        },
      },
    }));

    const result = await instance.reportTransactionEvent({
      time: new Date().toISOString(),
      message: "Test message",
      type: "AUTHORIZATION_ADJUSTMENT",
      amount: SaleorMoney.createFromStripe({
        amount: 10_12,
        currency: "USD",
      })._unsafeUnwrap(),
      pspReference: mockedStripePaymentIntentId,
      transactionId: mockedSaleorTransactionId,
      actions: [],
      externalReference: generateStripeDashboardUrl(mockedStripePaymentIntentId, "LIVE"),
    });

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(
      `[TransactionEventReporter.AlreadyReportedError: Event already reported: asd]`,
    );
  });

  it("returns event id in case of success", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      data: {
        transactionEventReport: {
          alreadyProcessed: false,
          transactionEvent: {
            id: "asd",
          },
        },
      },
    }));

    const result = await instance.reportTransactionEvent({
      time: new Date().toISOString(),
      message: "Test message",
      type: "AUTHORIZATION_ADJUSTMENT",
      amount: SaleorMoney.createFromStripe({
        amount: 10_12,
        currency: "USD",
      })._unsafeUnwrap(),
      pspReference: mockedStripePaymentIntentId,
      transactionId: mockedSaleorTransactionId,
      actions: [],
      externalReference: generateStripeDashboardUrl(mockedStripePaymentIntentId, "LIVE"),
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      {
        "createdEventId": "asd",
      }
    `);
  });
});
