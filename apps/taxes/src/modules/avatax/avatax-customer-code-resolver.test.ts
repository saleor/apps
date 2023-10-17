import { describe, expect, it } from "vitest";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { AvataxCustomerCodeResolver } from "./avatax-customer-code-resolver";
import {
  OrderConfirmedEventSubscriptionFragment,
  OrderConfirmedSubscriptionFragment,
} from "../../../generated/graphql";

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

const resolver = new AvataxCustomerCodeResolver();

describe("AvataxCustomerCodeResolver", () => {
  describe("resolveOrderCustomerCode", () => {
    it("returns user id when present in sourceObject", () => {
      const customerCode = resolver.resolveOrderCustomerCode(idOrderPayload);

      expect(customerCode).toBe("123");
    });
    it("returns 0 when no user id", () => {
      const customerCode = resolver.resolveOrderCustomerCode(noIdOrderPayload);

      expect(customerCode).toBe("0");
    });
  });
  describe("resolveCalculateTaxesCustomerCode", () => {
    describe("when checkout", () => {
      it("returns user id when present in sourceObject", () => {
        const customerCode = resolver.resolveCalculateTaxesCustomerCode(
          idCalculateTaxesCheckoutPayload,
        );

        expect(customerCode).toBe("123");
        it("returns 0 when no user id", () => {
          const customerCode = resolver.resolveCalculateTaxesCustomerCode(
            noIdCalculateTaxesCheckoutPayload,
          );

          expect(customerCode).toBe("0");
        });
      });
    });
    describe("when order", () => {
      it("returns user id when present in sourceObject", () => {
        const customerCode = resolver.resolveCalculateTaxesCustomerCode(
          idCalculateTaxesOrderPayload,
        );

        expect(customerCode).toBe("123");
      });
      it("returns 0 when no user id", () => {
        const customerCode = resolver.resolveCalculateTaxesCustomerCode(
          noIdCalculateTaxesOrderPayload,
        );

        expect(customerCode).toBe("0");
      });
    });
  });
});
