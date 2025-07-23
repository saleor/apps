import { describe, expect, it } from "vitest";

import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";

import { IdealPaymentMethod } from "./ideal";

describe("IdealPaymentMethod", () => {
  const idealPaymentMethod = new IdealPaymentMethod();

  describe("getCreatePaymentIntentMethodOptions", () => {
    it.each([{ flow: "AUTHORIZATION" as const }, { flow: "CHARGE" as const }])(
      "should return ideal payment method options when flow is $flow",
      ({ flow }) => {
        const saleorTransactionFlow = createSaleorTransactionFlow(flow);
        const result =
          idealPaymentMethod.getCreatePaymentIntentMethodOptions(saleorTransactionFlow);

        expect(result).toStrictEqual({
          ideal: {},
        });
      },
    );
  });
});
