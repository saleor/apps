import { describe, expect, it } from "vitest";

import { mockedSaleorChannelId } from "@/__tests__/mocks/saleor/mocked-saleor-channel-id";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-transaction-initialize-session-event";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { AtobaraiCustomer, createAtobaraiCustomer } from "./atobarai-customer";

describe("createAtobaraiCustomer", () => {
  const mockedCheckoutSourceObject = {
    ...mockedTransactionInitializeSessionEvent.sourceObject,
    __typename: "Checkout",
  } satisfies TransactionInitializeSessionEventFragment["sourceObject"];

  const mockedOrderSourceObject = {
    __typename: "Order",
    id: "order-id",
    userEmail: "user-order-email@example.com",
    channel: {
      id: mockedSaleorChannelId,
      slug: "default-channel",
      currencyCode: "JPY",
    },
    billingAddress: mockedTransactionInitializeSessionEvent.sourceObject.billingAddress,
    shippingAddress: null,
  } satisfies TransactionInitializeSessionEventFragment["sourceObject"];

  it("should create AtobaraiCustomer from TransactionInitializeSessionEvent for Saleor checkout", () => {
    const customer = createAtobaraiCustomer({
      sourceObject: mockedCheckoutSourceObject,
    });

    expect(customer).toMatchInlineSnapshot(`
        {
          "address": "BillingCountryAreaBillingStreetAddress1BillingStreetAddress2",
          "company_name": "BillingCompanyName",
          "customer_name": "BillingFirstName BillingLastName",
          "email": "transaction-initialize-session@email.com",
          "tel": "0billingPhone",
          "zip_code": "BillingPostalCode",
        }
      `);
  });

  it("should create AtobaraiCustomer from TransactionInitializeSessionEvent for Saleor order", () => {
    const customer = createAtobaraiCustomer({
      sourceObject: mockedOrderSourceObject,
    });

    expect(customer).toMatchInlineSnapshot(`
        {
          "address": "BillingCountryAreaBillingStreetAddress1BillingStreetAddress2",
          "company_name": "BillingCompanyName",
          "customer_name": "BillingFirstName BillingLastName",
          "email": "user-order-email@example.com",
          "tel": "0billingPhone",
          "zip_code": "BillingPostalCode",
        }
      `);
  });

  it("should throw MissingDataError when billing address is missing", () => {
    const eventWithoutBillingAddress = {
      sourceObject: {
        ...mockedCheckoutSourceObject,
        billingAddress: null,
      },
    };

    expect(() =>
      createAtobaraiCustomer(eventWithoutBillingAddress),
    ).toThrowErrorMatchingInlineSnapshot(
      `[AtobaraiCustomerMissingDataError: Billing address is required to create AtobaraiCustomer]`,
    );
  });

  it("should throw MissingDataError when Checkout email is missing", () => {
    const eventWithoutEmail = {
      sourceObject: {
        ...mockedCheckoutSourceObject,
        email: null,
      },
    };

    expect(() => createAtobaraiCustomer(eventWithoutEmail)).toThrowErrorMatchingInlineSnapshot(
      `[AtobaraiCustomerMissingDataError: Email is required to create AtobaraiCustomer]`,
    );
  });

  it("should throw MissingDataError when Order userEmail is missing", () => {
    const eventWithoutEmail = {
      sourceObject: {
        ...mockedOrderSourceObject,
        userEmail: null,
      },
    };

    expect(() => createAtobaraiCustomer(eventWithoutEmail)).toThrowErrorMatchingInlineSnapshot(
      `[AtobaraiCustomerMissingDataError: Email is required to create AtobaraiCustomer]`,
    );
  });

  it("should throw MissingDataError when phone number is missing", () => {
    const eventWithoutPhone = {
      sourceObject: {
        ...mockedCheckoutSourceObject,
        billingAddress: {
          ...mockedCheckoutSourceObject.billingAddress,
          phone: null,
        },
      },
    };

    expect(() => createAtobaraiCustomer(eventWithoutPhone)).toThrowErrorMatchingInlineSnapshot(
      `[AtobaraiCustomerMissingDataError: Phone number is required to create AtobaraiCustomer]`,
    );
  });

  it("should throw MissingDataError when phone number is empty string", () => {
    const eventWithEmptyPhone = {
      sourceObject: {
        ...mockedCheckoutSourceObject,
        billingAddress: {
          ...mockedCheckoutSourceObject.billingAddress,
          phone: "",
        },
      },
    };

    expect(() => createAtobaraiCustomer(eventWithEmptyPhone)).toThrowErrorMatchingInlineSnapshot(
      `[AtobaraiCustomerMissingDataError: Phone number is required to create AtobaraiCustomer]`,
    );
  });

  it("shoudn't be assignable without createAtobaraiCustomer", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiCustomer = { customer_name: "Test Customer" };

    expect(testValue).toBeDefined();
  });
});
