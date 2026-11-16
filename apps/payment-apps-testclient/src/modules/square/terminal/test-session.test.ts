import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearRejectedTerminalAttempt,
  parseTerminalState,
  post,
  readTestSession,
  RequestError,
  saveTestSession,
  shouldPollTerminal,
} from "./test-session";

const values = new Map<string, string>();

beforeEach(() => {
  values.clear();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("Terminal preflight rejection recovery", () => {
  const session = {
    saleorApiUrl: "https://example.saleor.cloud/graphql/",
    channel: "pos",
    checkoutId: "checkout-1",
    locationId: "location-1",
    deviceId: "device-1",
    attemptId: "attempt-0001",
  };

  it.each([
    "SQUARE_DEVICE_NOT_FOUND",
    "SQUARE_DEVICE_NOT_PAIRED",
    "SQUARE_DEVICE_WRONG_LOCATION",
    "SQUARE_LOCATION_NOT_FOUND",
    "SQUARE_LOCATION_MISMATCH",
    "SQUARE_LOCATION_INACTIVE",
    "SQUARE_LOCATION_CURRENCY_MISMATCH",
  ])("clears a confirmed %s rejection, including after refresh", async (code) => {
    saveTestSession(session);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(Response.json({ error: "Target rejected.", code }, { status: 502 })),
    );

    const error = await post("/api/terminal", { action: "start" }).catch((error: unknown) => error);

    expect(error).toBeInstanceOf(RequestError);
    expect(error).toMatchObject({ code, message: "Target rejected." });

    const corrected = clearRejectedTerminalAttempt(session, error);

    expect(corrected).toMatchObject({ locationId: session.locationId, deviceId: session.deviceId });
    saveTestSession(corrected!);

    expect(
      readTestSession("https://example.saleor.cloud/graphql/", "checkout-1")?.attemptId,
    ).toBeUndefined();
    expect(
      readTestSession("https://example.saleor.cloud/graphql/", "checkout-1")?.terminal,
    ).toBeUndefined();
  });

  it.each([
    new Error("Network timeout"),
    new SyntaxError("Malformed response"),
    new RequestError("Unknown outcome", 502, "ATTEMPT_RECONCILIATION_NEEDED"),
    new RequestError("Attempt conflict", 409, "ATTEMPT_CONFLICT"),
    new RequestError("Unknown location", 404, "NOT_FOUND"),
    new RequestError("Unknown outcome", 502),
  ])("preserves the target and recovery key for %s", (error) => {
    saveTestSession(session);
    expect(clearRejectedTerminalAttempt(session, error)).toBeNull();
    expect(readTestSession("https://example.saleor.cloud/graphql/", "checkout-1")).toStrictEqual(
      session,
    );
  });

  it("does not clear an attempt that already has a Terminal response", () => {
    const existing = {
      ...session,
      terminal: {
        terminalCheckoutId: "terminal-1",
        checkoutId: session.checkoutId,
        status: "PENDING" as const,
      },
    };

    expect(
      clearRejectedTerminalAttempt(
        existing,
        new RequestError("Target rejected", 404, "SQUARE_DEVICE_NOT_FOUND"),
      ),
    ).toBeNull();
  });

  it("ignores malformed error codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { error: "Target rejected.", code: { value: "SQUARE_DEVICE_NOT_FOUND" } },
            { status: 502 },
          ),
        ),
    );
    const error = await post("/api/terminal", {}).catch((error: unknown) => error);

    expect(clearRejectedTerminalAttempt(session, error)).toBeNull();
  });
});

describe("Terminal polling", () => {
  const pending = {
    terminalCheckoutId: "terminal-1",
    saleorTransactionId: "transaction-1",
    checkoutId: "checkout-1",
    status: "PENDING" as const,
  };

  it("polls an initiation response from an older app without pollUseful", () => {
    expect(shouldPollTerminal(pending)).toBe(true);
  });

  it("stops polling a completed attempt", () => {
    expect(shouldPollTerminal({ ...pending, status: "COMPLETED" })).toBe(false);
  });

  it("honors an explicit instruction to stop polling", () => {
    expect(shouldPollTerminal({ ...pending, pollUseful: false })).toBe(false);
  });
});

describe("Terminal response parsing", () => {
  it.each([
    { message: { text: "Pending" } },
    { saleorTransactionId: [] },
    { pollUseful: "false" },
    { operatorActionRequired: "false" },
  ])("rejects malformed display and control fields: %j", (fields) => {
    expect(() =>
      parseTerminalState({
        terminalCheckoutId: "terminal-1",
        checkoutId: "checkout-1",
        status: "PENDING",
        ...fields,
      }),
    ).toThrow("invalid response");
  });

  it("accepts a complete Terminal response", () => {
    expect(
      parseTerminalState({
        terminalCheckoutId: "terminal-1",
        checkoutId: "checkout-1",
        status: "PENDING",
      }),
    ).toStrictEqual({
      terminalCheckoutId: "terminal-1",
      checkoutId: "checkout-1",
      status: "PENDING",
    });
  });

  it("rejects a response without status instead of poisoning UI state", () => {
    expect(() =>
      parseTerminalState({ terminalCheckoutId: "terminal-1", checkoutId: "checkout-1" }),
    ).toThrow("Terminal app returned an invalid response. No payment was confirmed.");
  });

  it("repairs a previously persisted malformed response and keeps its attempt id", () => {
    values.set(
      "payment-testclient:terminal:https%3A%2F%2Fexample.saleor.cloud%2Fgraphql%2F:checkout-1",
      JSON.stringify({
        saleorApiUrl: "https://example.saleor.cloud/graphql/",
        channel: "pos",
        checkoutId: "checkout-1",
        attemptId: "attempt-0001",
        terminal: { terminalCheckoutId: "terminal-1", checkoutId: "checkout-1" },
      }),
    );

    expect(readTestSession("https://example.saleor.cloud/graphql/", "checkout-1")).toMatchObject({
      attemptId: "attempt-0001",
    });
    expect(
      readTestSession("https://example.saleor.cloud/graphql/", "checkout-1"),
    ).not.toHaveProperty("terminal");
    expect(
      JSON.parse(
        values.get(
          "payment-testclient:terminal:https%3A%2F%2Fexample.saleor.cloud%2Fgraphql%2F:checkout-1",
        )!,
      ),
    ).not.toHaveProperty("terminal");
  });
});

describe("Terminal session isolation", () => {
  it("does not recover another checkout or environment's attempt", () => {
    saveTestSession({
      saleorApiUrl: "https://one.example/graphql/",
      checkoutId: "checkout-1",
      attemptId: "attempt-1",
    });
    expect(readTestSession("https://two.example/graphql/", "checkout-1")).toBeNull();
    expect(readTestSession("https://one.example/graphql/", "checkout-2")).toBeNull();
    expect(readTestSession("https://one.example/graphql/", "checkout-1")?.attemptId).toBe(
      "attempt-1",
    );
  });
});
