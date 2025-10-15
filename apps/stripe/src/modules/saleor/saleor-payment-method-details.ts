import { err, ok, Result } from "neverthrow";
import Stripe from "stripe";

import { Paymentmethoddetails } from "@/generated/app-webhooks-types/transaction-process-session";
import { PaymentMethodDetailsInput } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";

export type SaleorPaymentMethodDetailsErrorType = InstanceType<
  typeof SaleorPaymentMethodDetails.SaleorPaymentMethodDetailsError
>;

export class SaleorPaymentMethodDetails {
  private stripePaymentMethod: Stripe.PaymentMethod;

  private constructor(stripePaymentMethod: Stripe.PaymentMethod) {
    this.stripePaymentMethod = stripePaymentMethod;
  }

  static SaleorPaymentMethodDetailsError = BaseError.subclass("SaleorPaymentMethodDetailsError", {
    props: {
      _internalName: "SaleorPaymentMethodDetails.SaleorPaymentMethodDetailsError" as const,
    },
  });

  static createFromStripe(
    paymentMethod: string | Stripe.PaymentMethod | null,
  ): Result<SaleorPaymentMethodDetails, SaleorPaymentMethodDetailsErrorType> {
    if (!paymentMethod) {
      return err(
        new SaleorPaymentMethodDetails.SaleorPaymentMethodDetailsError("Payment method is null"),
      );
    }

    if (typeof paymentMethod === "string") {
      return err(
        new SaleorPaymentMethodDetails.SaleorPaymentMethodDetailsError(
          "Payment method is a string",
        ),
      );
    }

    return ok(new SaleorPaymentMethodDetails(paymentMethod));
  }

  private getCardName() {
    return this.stripePaymentMethod.card?.display_brand || "ard";
  }

  toSaleorWebhookResponse(): Paymentmethoddetails {
    const type = this.stripePaymentMethod.type;

    if (type === "card") {
      return {
        type: "CARD",
        name: this.getCardName(),
        brand: this.stripePaymentMethod.card?.brand,
        lastDigits: this.stripePaymentMethod.card?.last4,
        expMonth: this.stripePaymentMethod.card?.exp_month,
        expYear: this.stripePaymentMethod.card?.exp_year,
      };
    }

    return {
      type: "OTHER",
      name: this.stripePaymentMethod.type,
    };
  }

  toSaleorTransactionEventPayload(): PaymentMethodDetailsInput {
    const type = this.stripePaymentMethod.type;

    if (type === "card") {
      return {
        card: {
          brand: this.stripePaymentMethod.card?.brand,
          name: this.getCardName(),
          lastDigits: this.stripePaymentMethod.card?.last4,
          expMonth: this.stripePaymentMethod.card?.exp_month,
          expYear: this.stripePaymentMethod.card?.exp_year,
        },
      };
    }

    return {
      other: {
        name: this.stripePaymentMethod.type,
      },
    };
  }
}
