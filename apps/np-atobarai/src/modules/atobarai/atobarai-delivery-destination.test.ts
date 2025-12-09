import { describe, expect, it } from "vitest";

import { mockedSaleorChannelId } from "@/__tests__/mocks/saleor/mocked-saleor-channel-id";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-transaction-initialize-session-event";
import { SourceObjectFragment } from "@/generated/graphql";

import { createAtobaraiDeliveryDestination } from "./atobarai-delivery-destination";

describe("createAtobaraiDeliveryDestination", () => {
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
    shippingAddress: mockedTransactionInitializeSessionEvent.sourceObject.shippingAddress,
    billingAddress: null,
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

  it("should create AtobaraiDeliveryDestination from TransactionInitializeSessionEvent for Saleor checkout", () => {
    const deliveryDestination = createAtobaraiDeliveryDestination({
      sourceObject: mockedCheckoutSourceObject,
    });

    expect(deliveryDestination).toMatchInlineSnapshot(`
      {
        "address": "ShippingCountryArea千代田区千代田ShippingStreetAddress1ShippingStreetAddress2",
        "company_name": "ShippingCompanyName",
        "customer_name": "ShippingLastName ShippingFirstName",
        "tel": "0shippingPhone",
        "zip_code": "1000001",
      }
    `);
  });

  it("should create AtobaraiDeliveryDestination from TransactionInitializeSessionEvent for Saleor order", () => {
    const deliveryDestination = createAtobaraiDeliveryDestination({
      sourceObject: mockedOrderSourceObject,
    });

    expect(deliveryDestination).toMatchInlineSnapshot(`
      {
        "address": "ShippingCountryArea千代田区千代田ShippingStreetAddress1ShippingStreetAddress2",
        "company_name": "ShippingCompanyName",
        "customer_name": "ShippingLastName ShippingFirstName",
        "tel": "0shippingPhone",
        "zip_code": "1000001",
      }
    `);
  });

  it("should throw MissingDataError when shipping address is missing", () => {
    const eventWithoutShippingAddress = {
      sourceObject: {
        ...mockedCheckoutSourceObject,
        shippingAddress: null,
      },
    };

    expect(() =>
      createAtobaraiDeliveryDestination(eventWithoutShippingAddress),
    ).toThrowErrorMatchingInlineSnapshot(
      `[AtobaraiDeliveryDestinationMissingDataError: Shipping address is required to create AtobaraiDeliveryDestination]`,
    );
  });

  it("should throw MissingDataError when phone number is missing", () => {
    const eventWithoutPhone = {
      sourceObject: {
        ...mockedCheckoutSourceObject,
        shippingAddress: {
          ...mockedCheckoutSourceObject.shippingAddress,
          phone: null,
        },
      },
    };

    expect(() =>
      createAtobaraiDeliveryDestination(eventWithoutPhone),
    ).toThrowErrorMatchingInlineSnapshot(
      `[AtobaraiDeliveryDestinationMissingDataError: Phone number is required to create AtobaraiDeliveryDestination]`,
    );
  });

  it("should throw MissingDataError when phone number is empty string", () => {
    const eventWithEmptyPhone = {
      sourceObject: {
        ...mockedCheckoutSourceObject,
        shippingAddress: {
          ...mockedCheckoutSourceObject.shippingAddress,
          phone: "",
        },
      },
    };

    expect(() =>
      createAtobaraiDeliveryDestination(eventWithEmptyPhone),
    ).toThrowErrorMatchingInlineSnapshot(
      `[AtobaraiDeliveryDestinationMissingDataError: Phone number is required to create AtobaraiDeliveryDestination]`,
    );
  });

  it("shouldn't be assignable without createAtobaraiDeliveryDestination", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiDeliveryDestination = { customer_name: "Test Customer" };

    expect(testValue).toBeDefined();
  });
});
