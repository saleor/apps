import { describe, expect, it } from "vitest";

import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";

import { CardPaymentMethod } from "./card";

describe("CardPaymentMethod", () => {
  const cardPaymentMethod = new CardPaymentMethod();

  describe("getCreatePaymentIntentMethodOptions", () => {
    it.each([
      { flow: "AUTHORIZATION" as const, captureMethod: "manual" },
      { flow: "CHARGE" as const, captureMethod: undefined },
    ])(
      "should set capture_method to $captureMethod when flow is $flow",
      ({ flow, captureMethod }) => {
        const saleorTransactionFlow = createSaleorTransactionFlow(flow)._unsafeUnwrap();
        const result = cardPaymentMethod.getCreatePaymentIntentMethodOptions(saleorTransactionFlow);

        expect(result._unsafeUnwrap()).toStrictEqual({
          card: { capture_method: captureMethod },
        });
      },
    );
  });
});
