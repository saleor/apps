import { beforeEach, describe, expect, it } from "vitest";

import {
  resolveAttachedCheckoutEmail,
  resolveCustomerSession,
  saveAttachedCheckout,
  saveCustomerSession,
} from "./storage-helpers";

beforeEach(() => localStorage.clear());

describe("Square customer session isolation", () => {
  it("does not send a customer's session to another Saleor environment", () => {
    const session = {
      email: "customer@example.com",
      token: "token",
      refreshToken: "refresh",
      userId: "user",
    };

    saveCustomerSession("https://one.example/graphql/", session);
    expect(resolveCustomerSession("https://two.example/graphql/")).toBeNull();
    expect(resolveCustomerSession("https://one.example/graphql/")).toStrictEqual(session);
  });
  it("scopes checkout attachment to the environment and checkout", () => {
    saveAttachedCheckout({
      envUrl: "https://one.example/graphql/",
      checkoutId: "checkout",
      email: "customer@example.com",
    });
    expect(resolveAttachedCheckoutEmail("https://two.example/graphql/", "checkout")).toBeNull();
    expect(
      resolveAttachedCheckoutEmail("https://one.example/graphql/", "other-checkout"),
    ).toBeNull();
    expect(resolveAttachedCheckoutEmail("https://one.example/graphql/", "checkout")).toBe(
      "customer@example.com",
    );
  });
});
