import { describe, expect, it } from "vitest";

import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";

import { RevolutPayPaymentMethod } from "./revolut-pay";

describe("RevolutPayPaymentMethod", () => {
  const paymentMethod = new RevolutPayPaymentMethod();

  describe("getCreatePaymentIntentMethodOptions", () => {
    it.each([
      { flow: "AUTHORIZATION" as const, captureMethod: "manual" },
      { flow: "CHARGE" as const, captureMethod: undefined },
    ])(
      "should set capture_method to $captureMethod when flow is $flow",
      ({ flow, captureMethod }) => {
        const saleorTransactionFlow = createSaleorTransactionFlow(flow);
        const result = paymentMethod.getCreatePaymentIntentMethodOptions(saleorTransactionFlow);

        expect(result).toStrictEqual({
          revolut_pay: { capture_method: captureMethod },
        });
      },
    );
  });
});
