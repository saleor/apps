import { describe, expect, it, vi } from "vitest";

import { parseFallbackRegisterData } from "./fallback-register-data";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("parseFallbackRegisterData", () => {
  it("returns null when additional_data is missing", () => {
    const result = parseFallbackRegisterData({});

    expect(result).toBeNull();
  });

  it("returns null when additional_data is not an object", () => {
    const result = parseFallbackRegisterData({ additional_data: "string" });

    expect(result).toBeNull();
  });

  it("returns null when additional_data is null", () => {
    const result = parseFallbackRegisterData({ additional_data: null });

    expect(result).toBeNull();
  });

  it("parses valid data with fallbackEnabled true and no redirect email", () => {
    const result = parseFallbackRegisterData({
      additional_data: { fallbackEnabled: true },
    });

    expect(result).toEqual({
      fallbackEnabled: true,
      fallbackRedirectEmail: undefined,
    });
  });

  it("parses valid data with fallbackEnabled false", () => {
    const result = parseFallbackRegisterData({
      additional_data: { fallbackEnabled: false },
    });

    expect(result).toEqual({
      fallbackEnabled: false,
      fallbackRedirectEmail: undefined,
    });
  });

  it("parses valid data with redirect email", () => {
    const result = parseFallbackRegisterData({
      additional_data: {
        fallbackEnabled: true,
        fallbackRedirectEmail: "redirect@example.com",
      },
    });

    expect(result).toEqual({
      fallbackEnabled: true,
      fallbackRedirectEmail: "redirect@example.com",
    });
  });

  it("parses valid data with null redirect email", () => {
    const result = parseFallbackRegisterData({
      additional_data: {
        fallbackEnabled: true,
        fallbackRedirectEmail: null,
      },
    });

    expect(result).toEqual({
      fallbackEnabled: true,
      fallbackRedirectEmail: null,
    });
  });

  it("returns disabled config when fallbackEnabled is missing", () => {
    const result = parseFallbackRegisterData({
      additional_data: { fallbackRedirectEmail: "test@example.com" },
    });

    expect(result).toEqual({
      fallbackEnabled: false,
      fallbackRedirectEmail: null,
    });
  });

  it("returns disabled config when fallbackEnabled is not a boolean", () => {
    const result = parseFallbackRegisterData({
      additional_data: { fallbackEnabled: "yes" },
    });

    expect(result).toEqual({
      fallbackEnabled: false,
      fallbackRedirectEmail: null,
    });
  });

  it("returns disabled config when redirect email is not a valid email", () => {
    const result = parseFallbackRegisterData({
      additional_data: {
        fallbackEnabled: true,
        fallbackRedirectEmail: "not-an-email",
      },
    });

    expect(result).toEqual({
      fallbackEnabled: false,
      fallbackRedirectEmail: null,
    });
  });

  it("stores redirect email even when fallback is disabled", () => {
    const result = parseFallbackRegisterData({
      additional_data: {
        fallbackEnabled: false,
        fallbackRedirectEmail: "redirect@example.com",
      },
    });

    expect(result).toEqual({
      fallbackEnabled: false,
      fallbackRedirectEmail: "redirect@example.com",
    });
  });
});
