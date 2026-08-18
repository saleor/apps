import { afterEach, describe, expect, it } from "vitest";

import { type OnboardingState } from "../onboarding-context/types";
import { type StoreReadiness } from "./get-store-readiness";
import { readHomeSnapshot, writeHomeSnapshot } from "./home-snapshot";

const prefs: OnboardingState = {
  onboardingExpanded: true,
  builderExpanded: false,
  stepsCompleted: [],
  stepsExpanded: {},
};

const readiness: StoreReadiness = {
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

afterEach(() => {
  sessionStorage.clear();
});

describe("home-snapshot", () => {
  it("round-trips a snapshot", () => {
    writeHomeSnapshot({
      saleorApiUrl: "https://example.saleor.cloud/graphql/",
      readiness,
      prefs,
    });

    expect(readHomeSnapshot()).toStrictEqual({
      saleorApiUrl: "https://example.saleor.cloud/graphql/",
      readiness,
      prefs,
    });
  });

  it("returns null when storage is empty or corrupt", () => {
    expect(readHomeSnapshot()).toBeNull();
    sessionStorage.setItem("saleor-app-onboarding:home-snapshot:v1", "{not json");
    expect(readHomeSnapshot()).toBeNull();
  });

  it("rejects a snapshot from another shop", () => {
    writeHomeSnapshot({
      saleorApiUrl: "https://shop-a.saleor.cloud/graphql/",
      readiness,
      prefs,
    });

    expect(readHomeSnapshot("https://shop-b.saleor.cloud/graphql/")).toBeNull();
    expect(readHomeSnapshot("https://shop-a.saleor.cloud/graphql/")).not.toBeNull();
  });

  it("treats trailing slashes as the same shop", () => {
    writeHomeSnapshot({
      saleorApiUrl: "https://shop-a.saleor.cloud/graphql/",
      readiness,
      prefs,
    });

    expect(readHomeSnapshot("https://shop-a.saleor.cloud/graphql")).not.toBeNull();
  });

  it("rejects unkeyed snapshots when a shop URL is known", () => {
    writeHomeSnapshot({
      saleorApiUrl: null,
      readiness,
      prefs,
    });

    expect(readHomeSnapshot("https://shop-a.saleor.cloud/graphql/")).toBeNull();
  });
});
