import { describe, expect, it } from "vitest";

import { editStripeConfigFormSchema } from "./edit-stripe-config-form-schema";

const validValues = {
  name: "Live",
  publishableKey: "pk_live_123",
  restrictedKey: "",
};

const parseIssues = (values: typeof validValues) => {
  const result = editStripeConfigFormSchema.safeParse(values);

  return result.success ? [] : result.error.issues;
};

describe("editStripeConfigFormSchema", () => {
  it("Accepts an empty restricted key, meaning the saved one is kept", () => {
    expect(editStripeConfigFormSchema.parse(validValues)).toStrictEqual(validValues);
  });

  it("Accepts a rotated restricted key from the same environment", () => {
    const values = { ...validValues, restrictedKey: "rk_live_456" };

    expect(editStripeConfigFormSchema.parse(values)).toStrictEqual(values);
  });

  it("Rejects a restricted key with a wrong prefix", () => {
    expect(parseIssues({ ...validValues, restrictedKey: "sk_live_123" })[0].message).toBe(
      "Invalid Restricted Key format. Must start with 'rk_test_' or 'rk_live_'.",
    );
  });

  it("Reports mixed environments on the restricted key field", () => {
    expect(
      parseIssues({
        ...validValues,
        publishableKey: "pk_test_123",
        restrictedKey: "rk_live_456",
      })[0],
    ).toMatchObject({
      message: "Both Publishable and Restricted Keys must be live or test",
      path: ["restrictedKey"],
    });
  });

  it("Requires a name", () => {
    expect(parseIssues({ ...validValues, name: "" })[0].message).toBe(
      "Configuration name is required.",
    );
  });
});
