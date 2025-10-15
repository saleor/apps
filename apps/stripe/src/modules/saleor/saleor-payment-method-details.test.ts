import { describe, expect, it } from "vitest";

import {
  mockedStripeCardPaymentMethod,
  mockedStripeOtherPaymentMethod,
} from "@/__tests__/mocks/mocked-stripe-payment-method";

import { SaleorPaymentMethodDetails } from "./saleor-payment-method-details";

describe("SaleorPaymentMethodDetails", () => {
  describe("createFromStripe", () => {
    it("creates a valid instance from Stripe PaymentMethod object", () => {
      const result = SaleorPaymentMethodDetails.createFromStripe(mockedStripeCardPaymentMethod);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBeInstanceOf(SaleorPaymentMethodDetails);
    });

    it("returns error when payment method is null", () => {
      const result = SaleorPaymentMethodDetails.createFromStripe(null);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        SaleorPaymentMethodDetails.SaleorPaymentMethodDetailsError,
      );
      expect(result._unsafeUnwrapErr().message).toBe("Payment method is null");
    });

    it("returns error when payment method is a string", () => {
      const result = SaleorPaymentMethodDetails.createFromStripe("pm_123456789");

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(
        SaleorPaymentMethodDetails.SaleorPaymentMethodDetailsError,
      );
      expect(result._unsafeUnwrapErr().message).toBe("Payment method is a string");
    });
  });

  describe("toSaleorWebhookResponse", () => {
    it("returns CARD type with all card details when payment method is a card", () => {
      const paymentMethodDetails = SaleorPaymentMethodDetails.createFromStripe(
        mockedStripeCardPaymentMethod,
      )._unsafeUnwrap();

      const result = paymentMethodDetails.toSaleorWebhookResponse();

      expect(result).toMatchInlineSnapshot(`
        {
          "brand": "visa",
          "expMonth": 12,
          "expYear": 2025,
          "lastDigits": "4242",
          "name": "Visa",
          "type": "CARD",
        }
      `);
    });

    it("returns CARD type with generic_card name when display_brand is missing", () => {
      const cardWithoutDisplayBrand = {
        ...mockedStripeCardPaymentMethod,
        card: {
          ...mockedStripeCardPaymentMethod.card!,
          display_brand: null,
        },
      };

      const paymentMethodDetails =
        SaleorPaymentMethodDetails.createFromStripe(cardWithoutDisplayBrand)._unsafeUnwrap();

      const result = paymentMethodDetails.toSaleorWebhookResponse();

      expect(result).toMatchInlineSnapshot(`
        {
          "brand": "visa",
          "expMonth": 12,
          "expYear": 2025,
          "lastDigits": "4242",
          "name": "ard",
          "type": "CARD",
        }
      `);
    });

    it("returns OTHER type with payment method type name for non-card payment methods", () => {
      const paymentMethodDetails = SaleorPaymentMethodDetails.createFromStripe(
        mockedStripeOtherPaymentMethod,
      )._unsafeUnwrap();

      const result = paymentMethodDetails.toSaleorWebhookResponse();

      expect(result).toMatchInlineSnapshot(`
        {
          "name": "sepa_debit",
          "type": "OTHER",
        }
      `);
    });
  });

  describe("toSaleorTransactionEventPayload", () => {
    it("returns card object with all card details when payment method is a card", () => {
      const paymentMethodDetails = SaleorPaymentMethodDetails.createFromStripe(
        mockedStripeCardPaymentMethod,
      )._unsafeUnwrap();

      const result = paymentMethodDetails.toSaleorTransactionEventPayload();

      expect(result).toMatchInlineSnapshot(`
        {
          "card": {
            "brand": "visa",
            "expMonth": 12,
            "expYear": 2025,
            "lastDigits": "4242",
            "name": "Visa",
          },
        }
      `);
    });

    it("returns card object with generic_card name when display_brand is missing", () => {
      const cardWithoutDisplayBrand = {
        ...mockedStripeCardPaymentMethod,
        card: {
          ...mockedStripeCardPaymentMethod.card!,
          display_brand: null,
        },
      };

      const paymentMethodDetails =
        SaleorPaymentMethodDetails.createFromStripe(cardWithoutDisplayBrand)._unsafeUnwrap();

      const result = paymentMethodDetails.toSaleorTransactionEventPayload();

      expect(result).toMatchInlineSnapshot(`
        {
          "card": {
            "brand": "visa",
            "expMonth": 12,
            "expYear": 2025,
            "lastDigits": "4242",
            "name": "ard",
          },
        }
      `);
    });

    it("returns other object with payment method type name for non-card payment methods", () => {
      const paymentMethodDetails = SaleorPaymentMethodDetails.createFromStripe(
        mockedStripeOtherPaymentMethod,
      )._unsafeUnwrap();

      const result = paymentMethodDetails.toSaleorTransactionEventPayload();

      expect(result).toMatchInlineSnapshot(`
        {
          "other": {
            "name": "sepa_debit",
          },
        }
      `);
    });
  });
});
