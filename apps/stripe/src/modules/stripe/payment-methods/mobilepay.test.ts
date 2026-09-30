import { describe, expect, it } from "vitest";

import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";

import { MobilePayPaymentMethod } from "./mobilepay";

describe("MobilePayPaymentMethod", () => {
  const paymentMethod = new MobilePayPaymentMethod();

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
          mobilepay: { capture_method: captureMethod },
        });
      },
    );
  });
});
