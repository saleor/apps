import { describe, expect, it } from "vitest";

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
        const result = cardPaymentMethod.getCreatePaymentIntentMethodOptions(flow);

        expect(result).toStrictEqual({
          card: { capture_method: captureMethod },
        });
      },
    );
  });
});
