import { describe, expect, it } from "vitest";

import { createAtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { createAtobaraiSecretSpCode } from "@/modules/atobarai/atobarai-secret-sp-code";
import { createAtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";

import { AppChannelConfig } from "./app-config";

describe("AppChannelConfig", () => {
  const validProps = {
    name: "Test Channel",
    id: "channel-1",
    shippingCompanyCode: "SAGAWA",
    useSandbox: true,
    skuAsName: false,
    merchantCode: createAtobaraiMerchantCode("M123"),
    secretSpCode: createAtobaraiSecretSpCode("SP456"),
    terminalId: createAtobaraiTerminalId("T789"),
  };

  it("should create a valid AppChannelConfig", () => {
    const result = AppChannelConfig.create(validProps);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBeInstanceOf(AppChannelConfig);
      expect(result.value.name).toBe(validProps.name);
    }
  });

  it("should fail validation with missing required fields", () => {
    // @ts-expect-error: intentionally testing missing required field
    const result = AppChannelConfig.create({ ...validProps, name: undefined });

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(AppChannelConfig.ValidationError);
    }
  });
});
