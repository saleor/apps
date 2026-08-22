import { describe, expect, it } from "vitest";

import { STRIPE_APP_IDENTIFIER } from "./app-identifiers";
import { type StoreReadiness } from "./get-store-readiness";
import { INSTALLED_APPS_PATH } from "./redirect-target";
import { getTaskCopy, getTaskCta, getTaskPermission } from "./task-copy";

const readyChannel: StoreReadiness = {
  channelId: "Q2hhbm5lbDox",
  channelName: "Default Channel",
  hasChannels: true,
  hasWarehouse: true,
  hasShipping: true,
  channelReady: true,
  hasProduct: false,
  hasPaymentApp: false,
  hasOrder: false,
  hasSmtpApp: false,
  hasStripeApp: false,
  channelsKnown: true,
  shippingKnown: true,
  productsKnown: true,
  paymentsKnown: true,
  ordersKnown: true,
};

describe("getTaskCopy", () => {
  it("glosses sales channel and locks without channel permission", () => {
    const copy = getTaskCopy("sales-channel", {
      ...readyChannel,
      channelId: null,
      channelName: null,
      hasChannels: false,
      hasWarehouse: false,
      hasShipping: false,
      channelReady: false,
      channelsKnown: false,
    });

    expect(copy.requirement).toBe("Missing permission to manage channels");
    expect(copy.description).toMatch(/sales channel/);
    expect(copy.description).toMatch(/currency, stock, and shipping/);
  });

  it("does not claim shipping is configured when the shipping query was skipped", () => {
    const copy = getTaskCopy("sales-channel", {
      ...readyChannel,
      hasShipping: false,
      shippingKnown: false,
      channelReady: true,
    });

    expect(copy.description).toMatch(/couldn’t be verified/i);
    expect(copy.description).not.toMatch(/has stock and shipping/);
  });

  it("recommends Dummy Payment when no payment app is installed", () => {
    const copy = getTaskCopy("payments", {
      ...readyChannel,
      hasProduct: true,
    });

    expect(copy.description).toMatch(/Dummy Payment/);
    expect(copy.details).toMatch(/Dummy Payment/);
    expect(copy.requirement).toBeUndefined();
  });

  it("uses ChannelSetupCard-style apps permission copy", () => {
    const copy = getTaskCopy("payments", {
      ...readyChannel,
      hasProduct: true,
      paymentsKnown: false,
    });

    expect(copy.requirement).toBe("Missing permission to manage apps");
  });
});

describe("getTaskCta / getTaskPermission", () => {
  it("deep-links channel create vs detail", () => {
    expect(getTaskCta("sales-channel", { ...readyChannel, channelId: null })).toStrictEqual({
      kind: "dashboard",
      to: "/channels/?action=create",
    });
    expect(getTaskCta("sales-channel", readyChannel)).toStrictEqual({
      kind: "dashboard",
      to: `/channels/${encodeURIComponent("Q2hhbm5lbDox")}`,
    });
  });

  it("opens Stripe via RedirectToApp when that payment app is installed", () => {
    expect(getTaskCta("payments", readyChannel)).toStrictEqual({
      kind: "dashboard",
      to: INSTALLED_APPS_PATH,
    });
    expect(getTaskCta("payments", { ...readyChannel, hasStripeApp: true })).toStrictEqual({
      kind: "app",
      appIdentifier: STRIPE_APP_IDENTIFIER,
      fallbackTo: INSTALLED_APPS_PATH,
    });
  });

  it("gates commerce CTAs on the matching Dashboard permission", () => {
    expect(getTaskPermission("sales-channel")).toBe("MANAGE_CHANNELS");
    expect(getTaskPermission("first-product")).toBe("MANAGE_PRODUCTS");
    expect(getTaskPermission("payments")).toBe("MANAGE_APPS");
    expect(getTaskPermission("test-order")).toBeUndefined();
  });
});
