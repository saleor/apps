import { describe, expect, it } from "vitest";

import { InitializeStripeSessionUseCase } from "@/app/api/gateway-initialize/use-case";

describe("InitializeStripeSessionUseCase", () => {
  it('Returns publishable key within "data" object if found in configuration', async () => {
    const uc = new InitializeStripeSessionUseCase();

    const responsePayload = await uc.execute();

    expect(responsePayload._unsafeUnwrap()).toStrictEqual({
      data: {
        stripePublishableKey: "todo", // todo fetch from config
      },
    });
  });

  it("Returns AppNotConfiguredError if config not found for specified channel", () => {
    const uc = new InitializeStripeSessionUseCase();

    const responsePayload = await uc.execute();

    const err = responsePayload._unsafeUnwrapErr();
  });
});
