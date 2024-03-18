import { describe, expect, it } from "vitest";
import { OrderCancelledPayload } from "../../webhooks/payloads/order-cancelled-payload";
import { AvataxConfigMockGenerator } from "../avatax-config-mock-generator";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";

const configMockGenerator = new AvataxConfigMockGenerator();
const avataxMockConfig = configMockGenerator.generateAvataxConfig();

describe("AvataxOrderCancelledPayloadTransformer", () => {
  it("throws an error when order = null", () => {
    const payload = { order: null } as any as OrderCancelledPayload;
    const transformer = new AvataxOrderCancelledPayloadTransformer(avataxMockConfig);

    expect(() => transformer.transform(payload)).toThrow("Order is required");
  });
  it("throws an error when no avataxId is present", () => {
    const payload = { order: {} } as any as OrderCancelledPayload;
    const transformer = new AvataxOrderCancelledPayloadTransformer(avataxMockConfig);

    expect(() => transformer.transform(payload)).toThrow();
  });
  it("returns a valid AvataxOrderCancelledTarget", () => {
    const payload = { order: { avataxId: "123" } } as any as OrderCancelledPayload;
    const transformer = new AvataxOrderCancelledPayloadTransformer(avataxMockConfig);

    const target = transformer.transform(payload);

    expect(target).toEqual({ transactionCode: "123", companyCode: "DEFAULT" });
  });
});
