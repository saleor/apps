// @vitest-environment node

import { createSecretKey } from "node:crypto";

import { jwtVerify } from "jose";
import { afterEach, describe, expect, it, vi } from "vitest";

import { signStaffToken, validateSaleorUrl } from "./server-config";

afterEach(() => vi.unstubAllEnvs());

describe("staff test client server boundary", () => {
  it("allows HTTPS and local Saleor GraphQL URLs", () => {
    expect(validateSaleorUrl("https://example.saleor.cloud/graphql/").href).toBe(
      "https://example.saleor.cloud/graphql/",
    );
    expect(validateSaleorUrl("http://localhost:8000/graphql/").href).toBe(
      "http://localhost:8000/graphql/",
    );
  });

  it("rejects unsafe or non-GraphQL Saleor URLs", () => {
    expect(() => validateSaleorUrl("http://example.com/graphql/")).toThrow("HTTPS");
    expect(() => validateSaleorUrl("https://example.com/api/")).toThrow("/graphql/");
  });

  it.each([undefined, "", "   "])("rejects a missing or blank app ID (%s)", async (appId) => {
    vi.stubEnv("SALEOR_APP_ID", appId);
    await expect(
      signStaffToken("staff-001", new URL("https://example.saleor.cloud/graphql/")),
    ).rejects.toThrow("SALEOR_APP_ID is not configured.");
  });

  it("signs the same short-lived actor token expected by the Terminal app", async () => {
    const secret = "a-test-secret-that-is-longer-than-thirty-two-characters";

    vi.stubEnv("SALEOR_APP_ID", "installed-terminal-app");
    vi.stubEnv("INTEGRATION_JWT_ISSUER", "https://staff-test.integration.example");
    vi.stubEnv("INTEGRATION_JWT_SHARED_SECRET", secret);

    const token = await signStaffToken(
      "staff-001",
      new URL("https://example.saleor.cloud/graphql/"),
    );
    const result = await jwtVerify(token, createSecretKey(Buffer.from(secret)), {
      issuer: "https://staff-test.integration.example",
      audience: "saleor.app.square.terminal",
    });

    expect(result.payload.sub).toBe("staff-001");
    expect(result.payload.saleor_api_url).toBe("https://example.saleor.cloud/graphql/");
    expect(result.payload.saleor_app_id).toBe("installed-terminal-app");
    expect(result.payload.role).toBe("terminal:payments");
    expect((result.payload.exp ?? 0) - (result.payload.iat ?? 0)).toBe(240);
  });
});
