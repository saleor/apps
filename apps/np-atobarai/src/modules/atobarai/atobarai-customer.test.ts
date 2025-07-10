import { describe, expect, it } from "vitest";

import { mockedSaleorChannelId } from "@/__tests__/mocks/saleor/mocked-saleor-channel-id";
import { mockedTransactionInitializeSessionEvent } from "@/__tests__/mocks/saleor-events/mocked-transaction-initialize-session-event";
import { TransactionInitializeSessionEventFragment } from "@/generated/graphql";

import { AtobaraiCustomer } from "./atobarai-customer";

describe("AtobaraiCustomer", () => {
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

  describe("createFromEvent", () => {
    it("should create AtobaraiCustomer from TransactionInitializeSessionEvent for Saleor checkout", () => {
      const customer = AtobaraiCustomer.createFromEvent({
        sourceObject: mockedCheckoutSourceObject,
      });

      expect(customer).toBeInstanceOf(AtobaraiCustomer);
    });

    it("should create AtobaraiCustomer from TransactionInitializeSessionEvent for Saleor order", () => {
      const customer = AtobaraiCustomer.createFromEvent({
        sourceObject: mockedOrderSourceObject,
      });

      expect(customer).toBeInstanceOf(AtobaraiCustomer);
    });

    it("should throw MissingDataError when billing address is missing", () => {
      const eventWithoutBillingAddress = {
        sourceObject: {
          ...mockedCheckoutSourceObject,
          billingAddress: null,
        },
      };

      expect(() =>
        AtobaraiCustomer.createFromEvent(eventWithoutBillingAddress),
      ).toThrowErrorMatchingInlineSnapshot(
        `[AtobaraiCustomer.MissingDataError: Billing address is required to create AtobaraiCustomer]`,
      );
    });

    it("should throw MissingDataError when Checkout email is missing", () => {
      const eventWithoutEmail = {
        sourceObject: {
          ...mockedCheckoutSourceObject,
          email: null,
        },
      };

      expect(() =>
        AtobaraiCustomer.createFromEvent(eventWithoutEmail),
      ).toThrowErrorMatchingInlineSnapshot(
        `[AtobaraiCustomer.MissingDataError: Email is required to create AtobaraiCustomer]`,
      );
    });

    it("should throw MissingDataError when Order userEmail is missing", () => {
      const eventWithoutEmail = {
        sourceObject: {
          ...mockedOrderSourceObject,
          userEmail: null,
        },
      };

      expect(() =>
        AtobaraiCustomer.createFromEvent(eventWithoutEmail),
      ).toThrowErrorMatchingInlineSnapshot(
        `[AtobaraiCustomer.MissingDataError: Email is required to create AtobaraiCustomer]`,
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

      expect(() =>
        AtobaraiCustomer.createFromEvent(eventWithoutPhone),
      ).toThrowErrorMatchingInlineSnapshot(
        `[AtobaraiCustomer.MissingDataError: Phone number is required to create AtobaraiCustomer]`,
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

      expect(() =>
        AtobaraiCustomer.createFromEvent(eventWithEmptyPhone),
      ).toThrowErrorMatchingInlineSnapshot(
        `[AtobaraiCustomer.MissingDataError: Phone number is required to create AtobaraiCustomer]`,
      );
    });
  });

  describe("getCustomerAddress", () => {
    it("should use Checkout email when sourceObject is Checkout", () => {
      const customer = AtobaraiCustomer.createFromEvent({
        sourceObject: mockedCheckoutSourceObject,
      });
      const result = customer.getCustomerAddress();

      expect(result.email).toMatchInlineSnapshot(`"ok@np-atobarai.saleor.io"`);
    });

    it("should use Order userEmail when sourceObject is Order", () => {
      const customer = AtobaraiCustomer.createFromEvent({ sourceObject: mockedOrderSourceObject });
      const result = customer.getCustomerAddress();

      expect(result.email).toMatchInlineSnapshot(`"user-order-email@example.com"`);
    });

    it("should return customer data in format required by Atobarai", () => {
      const customer = AtobaraiCustomer.createFromEvent({
        sourceObject: mockedCheckoutSourceObject,
      });
      const result = customer.getCustomerAddress();

      expect(result).toMatchInlineSnapshot(
        {},
        `
        {
          "address": "東京都千代田区麹町４－２－６",
          "company_name": "My company",
          "customer_name": "John Doe",
          "email": "ok@np-atobarai.saleor.io",
          "tel": "0 03-1234-5678",
          "zip_code": "102-0083",
        }
      `,
      );
    });

    it("should use firstName and lastName from billing address to create customer name with space", () => {
      const customer = AtobaraiCustomer.createFromEvent({
        sourceObject: mockedCheckoutSourceObject,
      });
      const result = customer.getCustomerAddress();

      expect(result.customer_name).toMatchInlineSnapshot(`"John Doe"`);
    });

    it("should convert billing address into Atobarai required address", () => {
      const customer = AtobaraiCustomer.createFromEvent({
        sourceObject: mockedCheckoutSourceObject,
      });
      const result = customer.getCustomerAddress();

      expect(result.address).toMatchInlineSnapshot(`"東京都千代田区麹町４－２－６"`);
    });

    it("should convert Japanese phone number to one that starts with 0 (required by Atobarai)", () => {
      const customer = AtobaraiCustomer.createFromEvent({
        sourceObject: mockedCheckoutSourceObject,
      });
      const result = customer.getCustomerAddress();

      expect(result.tel).toMatchInlineSnapshot(`"0 03-1234-5678"`);
    });
  });
});
