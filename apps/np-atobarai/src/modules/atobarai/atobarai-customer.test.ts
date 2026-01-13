import { describe, expect, it } from "vitest";

import { mockedSaleorChannelId } from "@/__tests__/mocks/saleor/mocked-saleor-channel-id";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-transaction-initialize-session-event";
import { SourceObjectFragment } from "@/generated/graphql";

import { AtobaraiCustomer, createAtobaraiCustomer } from "./atobarai-customer";

describe("createAtobaraiCustomer", () => {
  const mockedCheckoutSourceObject = {
    ...mockedTransactionInitializeSessionEvent.sourceObject,
    __typename: "Checkout",
  } satisfies SourceObjectFragment;

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
    shippingPrice: {
      gross: {
        amount: 137,
      },
    },
    lines: [],
    total: {
      gross: {
        amount: 1234,
      },
    },
  } satisfies SourceObjectFragment;

  it("should create AtobaraiCustomer from TransactionInitializeSessionEvent for Saleor checkout", () => {
    const customer = createAtobaraiCustomer({
      sourceObject: mockedCheckoutSourceObject,
    });

    expect(customer).toMatchInlineSnapshot(`
      {
        "address": "BillingCountryArea千代田区千代田BillingStreetAddress1BillingStreetAddress2",
        "company_name": "BillingCompanyName",
        "customer_name": "BillingLastName BillingFirstName",
        "email": "source-object@email.com",
        "tel": "0billingPhone",
        "zip_code": "1000001",
      }
    `);
  });

  it("should create AtobaraiCustomer from TransactionInitializeSessionEvent for Saleor order", () => {
    const customer = createAtobaraiCustomer({
      sourceObject: mockedOrderSourceObject,
    });

    expect(customer).toMatchInlineSnapshot(`
      {
        "address": "BillingCountryArea千代田区千代田BillingStreetAddress1BillingStreetAddress2",
        "company_name": "BillingCompanyName",
        "customer_name": "BillingLastName BillingFirstName",
        "email": "user-order-email@example.com",
        "tel": "0billingPhone",
        "zip_code": "1000001",
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

  it("should throw MissingDataError when email format is invalid", () => {
    const eventWithInvalidEmail = {
      sourceObject: {
        ...mockedCheckoutSourceObject,
        email: "invalid-email-format",
      },
    };

    expect(() => createAtobaraiCustomer(eventWithInvalidEmail)).toThrowErrorMatchingInlineSnapshot(
      `
      [AtobaraiCustomerMissingDataError: [
        {
          "validation": "email",
          "code": "invalid_string",
          "message": "Invalid email",
          "path": [
            "email"
          ]
        }
      ]
      ZodValidationError: Validation error: Invalid email at "email"
      Invalid customer data: Validation error: Invalid email at "email"]
    `,
    );
  });

  it("shouldn't be assignable without createAtobaraiCustomer", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiCustomer = { customer_name: "Test Customer" };

    expect(testValue).toBeDefined();
  });
});
