import { beforeEach, describe, expect, it, vi } from "vitest";

import { SubscriptionPayloadErrorChecker } from "./error-utils";

describe("SubscriptionPayloadErrorChecker", () => {
  const mockError = vi.fn();
  const mockInfo = vi.fn();
  const mockErrorCapture = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each(["OrderCancelled", "OrderConfirmed", "CalculateTaxes"])(
    "should log error when payload contains unhandled GraphQL error for %s",
    (typename) => {
      const payload = {
        __typename: typename,
        errors: [
          {
            message: "Error message",
            source: "Error source",
          },
        ],
      } as any;

      const checker = new SubscriptionPayloadErrorChecker(
        { error: mockError, info: mockInfo },
        mockErrorCapture,
      );

      checker.checkPayload(payload);

      expect(mockError).toHaveBeenCalledWith(
        `Payload contains unhandled GraphQL error for ${typename}`,
        {
          error: expect.any(SubscriptionPayloadErrorChecker.SubscriptionPayloadError),
          subscription: typename,
        },
      );
      expect(mockErrorCapture).toHaveBeenCalledWith(
        expect.any(SubscriptionPayloadErrorChecker.SubscriptionPayloadError),
      );
      expect(mockInfo).not.toHaveBeenCalled();
    },
  );

  it.each(["OrderCancelled", "OrderConfirmed", "CalculateTaxes"])(
    "should not log error when payload does not contain GraphQL error for %s",
    (typename) => {
      const payload = {
        __typename: typename,
      } as any;

      const checker = new SubscriptionPayloadErrorChecker(
        { error: mockError, info: mockInfo },
        mockErrorCapture,
      );

      checker.checkPayload(payload);

      expect(mockError).not.toHaveBeenCalled();
      expect(mockErrorCapture).not.toHaveBeenCalled();
      expect(mockInfo).not.toHaveBeenCalled();
    },
  );

  it("should not log error when payload contains handled error", () => {
    const payload = {
      __typename: "CalculateTaxes",
      errors: [
        {
          message: "Error message",
          source: "Error source",
          path: ["event", "taxBase", "sourceObject", "user"],
        },
      ],
    } as any;

    const checker = new SubscriptionPayloadErrorChecker(
      { error: mockError, info: mockInfo },
      mockErrorCapture,
    );

    checker.checkPayload(payload);

    expect(mockInfo).toHaveBeenCalledWith(
      "Payload contains handled GraphQL error for CalculateTaxes",
      {
        error: expect.any(SubscriptionPayloadErrorChecker.SubscriptionPayloadError),
        subscription: "CalculateTaxes",
      },
    );

    expect(mockError).not.toHaveBeenCalled();
    expect(mockErrorCapture).not.toHaveBeenCalled();
  });
});
