import { describe, expect, it, vi } from "vitest";

import { env } from "../../env";
import { getRedirectEmailConfig } from "./redirect-email-config";

vi.mock("../../env", () => ({
  env: {
    FALLBACK_EMAIL_REDIRECT_ENDPOINT: undefined as string | undefined,
    FALLBACK_EMAIL_REDIRECT_TOKEN: undefined as string | undefined,
  },
}));

describe("getRedirectEmailConfig", () => {
  it("returns config when both endpoint and token are set", () => {
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_ENDPOINT = "https://redirect.example.com/api";
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_TOKEN = "secret-token";

    const result = getRedirectEmailConfig();

    expect(result).toStrictEqual({
      endpointUrl: "https://redirect.example.com/api",
      token: "secret-token",
    });
  });

  it("returns null when only endpoint is set without token", () => {
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_ENDPOINT = "https://redirect.example.com/api";
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_TOKEN = undefined;

    const result = getRedirectEmailConfig();

    expect(result).toBeNull();
  });

  it("returns null when only token is set without endpoint", () => {
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_ENDPOINT = undefined;
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_TOKEN = "secret-token";

    const result = getRedirectEmailConfig();

    expect(result).toBeNull();
  });

  it("returns null when neither endpoint nor token are set", () => {
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_ENDPOINT = undefined;
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_TOKEN = undefined;

    const result = getRedirectEmailConfig();

    expect(result).toBeNull();
  });

  it("returns null when endpoint is not a valid URL", () => {
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_ENDPOINT = "not-a-url";
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_TOKEN = "secret-token";

    const result = getRedirectEmailConfig();

    expect(result).toBeNull();
  });

  it("returns null when token is empty string", () => {
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_ENDPOINT = "https://redirect.example.com/api";
    vi.mocked(env).FALLBACK_EMAIL_REDIRECT_TOKEN = "";

    const result = getRedirectEmailConfig();

    expect(result).toBeNull();
  });
});
