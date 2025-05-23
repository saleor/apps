import { describe, expect, it } from "vitest";

import { ResponseMessageFormatter } from "@/app/api/webhooks/saleor/response-message-formatter";

describe("ResponseMessageFormatter", () => {
  it("Returns message if Stripe env in context is LIVE", () => {
    const formatter = new ResponseMessageFormatter({
      stripeEnv: "LIVE",
    });

    expect(formatter.formatMessage("Message", new Error("Error"))).toBe("Message");
  });

  it("Returns message if Stripe env in context is TEST but Error.message is missing", () => {
    const formatter = new ResponseMessageFormatter({
      stripeEnv: "TEST",
    });

    expect(formatter.formatMessage("Message", {} as Error)).toBe("Message");
  });

  it("Returns message and error message if Stripe env in context is TEST and Error.message is available", () => {
    const formatter = new ResponseMessageFormatter({
      stripeEnv: "TEST",
    });

    expect(formatter.formatMessage("Message", new Error("Error"))).toBe("Message: Error");
  });
});
