import { describe, expect, it } from "vitest";

import { type StoreReadiness } from "./get-store-readiness";
import { getTaskCopy, getTaskHref, getTaskPermission } from "./task-copy";

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
  smtpAppId: null,
  stripeAppId: null,
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

describe("getTaskHref / getTaskPermission", () => {
  it("deep-links channel create vs detail", () => {
    expect(getTaskHref("sales-channel", { ...readyChannel, channelId: null })).toBe(
      "/channels/?action=create",
    );
    expect(getTaskHref("sales-channel", readyChannel)).toBe(
      `/channels/${encodeURIComponent("Q2hhbm5lbDox")}`,
    );
  });

  it("deep-links payments to Stripe app when installed", () => {
    expect(getTaskHref("payments", readyChannel)).toBe("/extensions/installed");
    expect(getTaskHref("payments", { ...readyChannel, stripeAppId: "QXBwOlN0cmlwZQ==" })).toBe(
      `/extensions/app/${encodeURIComponent("QXBwOlN0cmlwZQ==")}`,
    );
  });

  it("gates commerce CTAs on the matching Dashboard permission", () => {
    expect(getTaskPermission("sales-channel")).toBe("MANAGE_CHANNELS");
    expect(getTaskPermission("first-product")).toBe("MANAGE_PRODUCTS");
    expect(getTaskPermission("payments")).toBe("MANAGE_APPS");
    expect(getTaskPermission("test-order")).toBeUndefined();
  });
});
