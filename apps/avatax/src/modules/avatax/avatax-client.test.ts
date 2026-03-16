import { describe, expect, it, vi } from "vitest";

import { AvataxTimeoutError } from "../taxes/tax-error";
import { AvataxClient } from "./avatax-client";

const createMockSdkClient = (overrides: Record<string, unknown> = {}) =>
  ({
    baseUrl: "https://sandbox-rest.avatax.com",
    ping: vi.fn(),
    createOrAdjustTransaction: vi.fn(),
    resolveAddress: vi.fn(),
    listTaxCodes: vi.fn(),
    voidTransaction: vi.fn(),
    listEntityUseCodes: vi.fn(),
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

describe("AvataxClient", () => {
  describe("timeout error handling", () => {
    it("Returns AvataxTimeoutError when SDK throws Error('timeout')", async () => {
      const mockSdk = createMockSdkClient({
        ping: vi.fn().mockRejectedValue(new Error("timeout")),
      });
      const client = new AvataxClient(mockSdk);

      const result = await client.ping();

      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AvataxTimeoutError);
      expect(error.message).toContain("AvaTax API request timed out");
    });

    it("Returns AvataxTimeoutError when createTransaction SDK call times out", async () => {
      const mockSdk = createMockSdkClient({
        createOrAdjustTransaction: vi.fn().mockRejectedValue(new Error("timeout")),
      });
      const client = new AvataxClient(mockSdk);

      const result = await client.createTransaction({
        model: {} as never,
      });

      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AvataxTimeoutError);
    });

    it("Returns AvataxTimeoutError when validateAddress SDK call times out", async () => {
      const mockSdk = createMockSdkClient({
        resolveAddress: vi.fn().mockRejectedValue(new Error("timeout")),
      });
      const client = new AvataxClient(mockSdk);

      const result = await client.validateAddress({
        address: {} as never,
      });

      const error = result._unsafeUnwrapErr();

      expect(error).toBeInstanceOf(AvataxTimeoutError);
    });

    it("Does not return AvataxTimeoutError for non-timeout errors", async () => {
      const mockSdk = createMockSdkClient({
        ping: vi.fn().mockRejectedValue(new Error("some other error")),
      });
      const client = new AvataxClient(mockSdk);

      const result = await client.ping();

      const error = result._unsafeUnwrapErr();

      expect(error).not.toBeInstanceOf(AvataxTimeoutError);
    });

    it("Delegates non-timeout errors to AvataxErrorsParser", async () => {
      const avataxApiError = {
        code: "InvalidAddress",
        details: [{ description: "Invalid", message: "Invalid" }],
      };
      const mockSdk = createMockSdkClient({
        ping: vi.fn().mockRejectedValue(avataxApiError),
      });
      const client = new AvataxClient(mockSdk);

      const result = await client.ping();

      const error = result._unsafeUnwrapErr();

      expect(error).not.toBeInstanceOf(AvataxTimeoutError);
    });
  });
});
