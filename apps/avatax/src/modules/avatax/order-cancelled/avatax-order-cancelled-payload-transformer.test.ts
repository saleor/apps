import { describe, expect, it } from "vitest";
import { OrderCancelledPayload } from "../../webhooks/payloads/order-cancelled-payload";
import { AvataxConfigMockGenerator } from "../avatax-config-mock-generator";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";

const configMockGenerator = new AvataxConfigMockGenerator();
const avataxMockConfig = configMockGenerator.generateAvataxConfig();

describe("AvataxOrderCancelledPayloadTransformer", () => {
  it("throws an error when no avataxId is present", () => {
    const payload = { order: {} } as any as OrderCancelledPayload;
    const transformer = new AvataxOrderCancelledPayloadTransformer();

    expect(() =>
      // @ts-expect-error
      transformer.transform(payload.order?.avataxId, avataxMockConfig.companyCode),
    ).toThrow();
  });
  it("returns a valid AvataxOrderCancelledTarget", () => {
    const payload = { order: { avataxId: "123" } } as any as OrderCancelledPayload;
    const transformer = new AvataxOrderCancelledPayloadTransformer();

    // @ts-expect-error
    const target = transformer.transform(payload.order?.avataxId, avataxMockConfig.companyCode);

    expect(target).toEqual({ transactionCode: "123", companyCode: "DEFAULT" });
  });
});
