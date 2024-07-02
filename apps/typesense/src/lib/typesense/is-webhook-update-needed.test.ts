import { describe, expect, it } from "vitest";
import { isWebhookUpdateNeeded } from "./is-webhook-update-needed";

describe("isWebhookUpdateNeeded", () => {
  it("Returns false, when all webhooks are installed", () => {
    expect(
      isWebhookUpdateNeeded({
        existingWebhookNames: [
          "PRODUCT_CREATED webhook",
          "PRODUCT_UPDATED webhook",
          "PRODUCT_DELETED webhook",
          "PRODUCT_VARIANT_CREATED webhook",
          "PRODUCT_VARIANT_UPDATED webhook",
          "PRODUCT_VARIANT_DELETED webhook",
          "PRODUCT_VARIANT_BACK_IN_STOCK webhook",
          "PRODUCT_VARIANT_OUT_OF_STOCK webhook",
        ],
      }),
    ).toBe(false);
  });

  it("Returns true, when passed list of names is not contain all of the hooks", () => {
    expect(
      isWebhookUpdateNeeded({
        existingWebhookNames: [],
      }),
    ).toBe(true);
  });
});
