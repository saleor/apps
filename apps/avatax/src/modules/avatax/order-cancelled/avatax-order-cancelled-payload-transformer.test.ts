import { describe, expect, it } from "vitest";
import { AvataxConfigMockGenerator } from "../avatax-config-mock-generator";
import { AvataxOrderCancelledPayloadTransformer } from "./avatax-order-cancelled-payload-transformer";
import { CancelOrderPayload } from "../../taxes/tax-provider-webhook";

const configMockGenerator = new AvataxConfigMockGenerator();
const avataxMockConfig = configMockGenerator.generateAvataxConfig();

describe("AvataxOrderCancelledPayloadTransformer", () => {
  it("throws an error when no avataxId is present", () => {
    const payload = {} as any as CancelOrderPayload;
    const transformer = new AvataxOrderCancelledPayloadTransformer();

    expect(() => transformer.transform(payload, avataxMockConfig.companyCode)).toThrow();
  });
  it("returns a valid AvataxOrderCancelledTarget", () => {
    const payload = { avataxId: "123" } as any as CancelOrderPayload;
    const transformer = new AvataxOrderCancelledPayloadTransformer();

    const target = transformer.transform(payload, avataxMockConfig.companyCode);

    expect(target).toEqual({ transactionCode: "123", companyCode: "DEFAULT" });
  });
});
