import { describe, expect, it } from "vitest";

import { SquareGatewayConfigSchema } from "./square-gateway-config";

const browserConfig = {
  environment: "sandbox" as const,
  applicationId: "square-app-id",
  locationId: "square-location-id",
};

describe("SquareGatewayConfigSchema", () => {
  it("accepts card-only capabilities without a country code", () => {
    const result = SquareGatewayConfigSchema.safeParse({
      square: browserConfig,
      captureMode: "CHARGE",
      methods: ["card", "saved-card"],
    });

    expect(result.success).toBe(true);
  });

  it("requires a country code when a wallet method is advertised", () => {
    const result = SquareGatewayConfigSchema.safeParse({
      square: browserConfig,
      captureMode: "CHARGE",
      methods: ["card", "apple-pay"],
    });

    expect(result.success).toBe(false);
  });

  it("accepts wallet capabilities with a country code", () => {
    const result = SquareGatewayConfigSchema.safeParse({
      square: { ...browserConfig, countryCode: "US" },
      captureMode: "CHARGE",
      methods: ["card", "cash-app-pay"],
    });

    expect(result.success).toBe(true);
  });
});
