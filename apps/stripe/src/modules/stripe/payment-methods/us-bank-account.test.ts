import { describe, expect, it } from "vitest";

import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";

import { USBankAccountPaymentMethod } from "./us-bank-account";

describe("USBankAccountPaymentMethod", () => {
  const paymentMethod = new USBankAccountPaymentMethod();

  describe("getResolvedTransactionFlow", () => {
    it.each([{ flow: "AUTHORIZATION" as const }, { flow: "CHARGE" as const }])(
      "should resolve transaction flow to CHARGE for $flow",
      ({ flow }) => {
        const saleorTransactionFlow = createSaleorTransactionFlow(flow);
        const result = paymentMethod.getResolvedTransactionFlow(saleorTransactionFlow);

        expect(result).toBe("CHARGE");
      },
    );
  });
});
