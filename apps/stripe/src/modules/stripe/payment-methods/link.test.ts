import { describe, expect, it } from "vitest";

import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";

import { LinkPaymentMethod } from "./link";

describe("LinkPaymentMethod", () => {
  const linkPaymentMethod = new LinkPaymentMethod();

  describe("getCreatePaymentIntentMethodOptions", () => {
    it.each([
      { flow: "AUTHORIZATION" as const, captureMethod: "manual" },
      { flow: "CHARGE" as const, captureMethod: undefined },
    ])(
      "should set capture_method to $captureMethod when flow is $flow",
      ({ flow, captureMethod }) => {
        const saleorTransactionFlow = createSaleorTransactionFlow(flow);
        const result = linkPaymentMethod.getCreatePaymentIntentMethodOptions(saleorTransactionFlow);

        expect(result).toStrictEqual({
          link: { capture_method: captureMethod },
        });
      },
    );
  });
});
