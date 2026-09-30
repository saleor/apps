import { describe, expect, it } from "vitest";

import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";

import { PayByBankPaymentMethod } from "./pay-by-bank";

describe("PayByBankPaymentMethod", () => {
  const paymentMethod = new PayByBankPaymentMethod();

  it.each(["AUTHORIZATION" as const, "CHARGE" as const])(
    "should always resolve to CHARGE when flow is %s",
    (flow) => {
      const saleorTransactionFlow = createSaleorTransactionFlow(flow);

      expect(paymentMethod.getResolvedTransactionFlow(saleorTransactionFlow)).toBe("CHARGE");
      expect(
        paymentMethod.getCreatePaymentIntentMethodOptions(saleorTransactionFlow),
      ).toStrictEqual({ pay_by_bank: {} });
    },
  );
});
