import { describe, expect, it, vi } from "vitest";

import { mockedSaleorTransactionId } from "@/__tests__/mocks/constants";
import { mockedGraphqlClient } from "@/__tests__/mocks/graphql-client";
import { mockedStripePaymentIntentId } from "@/__tests__/mocks/mocked-stripe-payment-intent-id";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { TransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";

describe("TransactionEventReporter", () => {
  const instance = new TransactionEventReporter({
    graphqlClient: mockedGraphqlClient,
  });

  it("Returns AlreadyReportedError if graphql error points ALREADY_EXISTS", async () => {
    // @ts-expect-error - patching only subset
    vi.spyOn(mockedGraphqlClient, "mutation").mockImplementationOnce(async () => ({
      error: {
        cause: "ALREADY_EXISTS",
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
    });

    expect(result._unsafeUnwrapErr()).toMatchInlineSnapshot(`
      [TransactionEventReporter.AlreadyReportedError: ALREADY_EXISTS
      {}
      Event already reported]
    `);
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
    });

    expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
      {
        "createdEventId": "asd",
      }
    `);
  });
});
