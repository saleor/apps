import { describe, expect, it } from "vitest";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { avataxData } from "./avatax-data-resolver";

const idOrderPayload = {
  user: {
    id: "123",
  },
} as unknown as OrderConfirmedSubscriptionFragment;

const noIdOrderPayload = {} as unknown as OrderConfirmedSubscriptionFragment;

const noIdCalculateTaxesCheckoutPayload = {
  taxBase: {
    sourceObject: {
      __typename: "Checkout",
    },
  },
} as unknown as CalculateTaxesPayload;

const idCalculateTaxesCheckoutPayload = {
  taxBase: {
    sourceObject: {
      __typename: "Checkout",
      user: {
        id: "123",
      },
    },
  },
} as unknown as CalculateTaxesPayload;

const noIdCalculateTaxesOrderPayload = {
  taxBase: {
    sourceObject: {
      __typename: "Order",
    },
  },
} as unknown as CalculateTaxesPayload;

const idCalculateTaxesOrderPayload = {
  taxBase: {
    sourceObject: {
      __typename: "Order",
      user: {
        id: "123",
      },
    },
  },
} as unknown as CalculateTaxesPayload;

describe("avataxData", () => {
  describe("customerCode", () => {
    describe("resolveFromOrder", () => {
      it("returns user id when present in sourceObject", () => {
        const customerCode = avataxData.customerCode.resolveFromOrder(idOrderPayload);

        expect(customerCode).toBe("123");
      });
      it("returns 0 when no user id", () => {
        const customerCode = avataxData.customerCode.resolveFromOrder(noIdOrderPayload);

        expect(customerCode).toBe("0");
      });
    });
    describe("resolveFromCalculateTaxes", () => {
      describe("when checkout", () => {
        it("returns user id when present in sourceObject", () => {
          const customerCode = avataxData.customerCode.resolveFromCalculateTaxes(
            idCalculateTaxesCheckoutPayload,
          );

          expect(customerCode).toBe("123");
          it("returns 0 when no user id", () => {
            const customerCode = avataxData.customerCode.resolveFromCalculateTaxes(
              noIdCalculateTaxesCheckoutPayload,
            );

            expect(customerCode).toBe("0");
          });
        });
      });
      describe("when order", () => {
        it("returns user id when present in sourceObject", () => {
          const customerCode = avataxData.customerCode.resolveFromCalculateTaxes(
            idCalculateTaxesOrderPayload,
          );

          expect(customerCode).toBe("123");
        });
        it("returns 0 when no user id", () => {
          const customerCode = avataxData.customerCode.resolveFromCalculateTaxes(
            noIdCalculateTaxesOrderPayload,
          );

          expect(customerCode).toBe("0");
        });
      });
    });
  });
});
