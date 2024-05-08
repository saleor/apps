import { beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionPayloadErrorChecker } from "./error-utils";

describe("SubscriptionPayloadErrorChecker", () => {
  const mockError = vi.fn();
  const mockErrorCapture = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each(["OrderCancelled", "OrderConfirmed", "CalculateTaxes"])(
    "should log error when payload contains GraphQL error for %s",
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

      const checker = new SubscriptionPayloadErrorChecker({ error: mockError }, mockErrorCapture);

      checker.checkPayload(payload);

      expect(mockError).toHaveBeenCalledWith(`Payload contains GraphQL error for ${typename}`, {
        error: expect.any(SubscriptionPayloadErrorChecker.SubscriptionPayloadError),
        subscription: typename,
      });
      expect(mockErrorCapture).toHaveBeenCalledWith(
        expect.any(SubscriptionPayloadErrorChecker.SubscriptionPayloadError),
      );
    },
  );

  it.each(["OrderCancelled", "OrderConfirmed", "CalculateTaxes"])(
    "should not log error when payload does not contain GraphQL error for %s",
    (typename) => {
      const payload = {
        __typename: typename,
      } as any;

      const checker = new SubscriptionPayloadErrorChecker({ error: mockError }, mockErrorCapture);

      checker.checkPayload(payload);

      expect(mockError).not.toHaveBeenCalled();
      expect(mockErrorCapture).not.toHaveBeenCalled();
    },
  );
});
