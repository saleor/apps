import { describe, expect, it } from "vitest";

import { FallbackSenderEmail } from "./fallback-sender-email";

describe("FallbackSenderEmail", () => {
  describe("getEmail", () => {
    it("extracts subdomain and combines with domain", () => {
      const email = new FallbackSenderEmail(
        "https://abc.saleor.cloud/graphql/",
        "example.com",
      ).getEmail();

      expect(email).toBe("abc@example.com");
    });

    it("works with eu suffix URL", () => {
      const email = new FallbackSenderEmail(
        "https://my-store.eu.saleor.cloud/graphql/",
        "notifications.saleor.cloud",
      ).getEmail();

      expect(email).toBe("my-store@notifications.saleor.cloud");
    });

    it("works with URL containing port", () => {
      const email = new FallbackSenderEmail(
        "https://localhost:8000/graphql/",
        "example.com",
      ).getEmail();

      expect(email).toBe("localhost@example.com");
    });

    it("throws if invalid URL is provided", () => {
      const fallback = new FallbackSenderEmail("invalid", "example.com");

      expect(() => fallback.getEmail()).toThrowErrorMatchingInlineSnapshot(
        `[Error: Failed to parse Saleor API URL, usually that means Saleor request did not include it, or there is application error. Received: "invalid"]`,
      );
    });
  });
});
