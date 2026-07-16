import { describe, expect, it } from "vitest";

import { smtpUpdateCustomVariablesSchema } from "./smtp-config-input-schema";

describe("smtpUpdateCustomVariablesSchema", () => {
  it("accepts valid identifier keys and empty values", () => {
    const result = smtpUpdateCustomVariablesSchema.safeParse({
      id: "config-1",
      variables: [
        { key: "storefrontUrl", value: "https://shop.example" },
        { key: "support_phone", value: "" },
        { key: "_internal", value: "x" },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts an empty variables array", () => {
    const result = smtpUpdateCustomVariablesSchema.safeParse({ id: "config-1", variables: [] });

    expect(result.success).toBe(true);
  });

  it("rejects keys that are not valid Handlebars identifiers", () => {
    for (const key of ["storefront-url", "with space", "1leading", "with.dot"]) {
      const result = smtpUpdateCustomVariablesSchema.safeParse({
        id: "config-1",
        variables: [{ key, value: "x" }],
      });

      expect(result.success, `expected "${key}" to be rejected`).toBe(false);
    }
  });

  it("rejects empty keys", () => {
    const result = smtpUpdateCustomVariablesSchema.safeParse({
      id: "config-1",
      variables: [{ key: "", value: "x" }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects duplicate keys", () => {
    const result = smtpUpdateCustomVariablesSchema.safeParse({
      id: "config-1",
      variables: [
        { key: "storefrontUrl", value: "a" },
        { key: "storefrontUrl", value: "b" },
      ],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Duplicate key");
    }
  });
});
