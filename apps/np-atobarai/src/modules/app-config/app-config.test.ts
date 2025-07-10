import { describe, expect, it } from "vitest";

import { createAtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { createAtobaraiSpCode } from "@/modules/atobarai/atobarai-sp-code";
import { createAtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";

import { AppChannelConfig, AppRootConfig } from "./app-config";

describe("AppChannelConfig", () => {
  const validProps = {
    name: "Test Channel",
    id: "channel-1",
    shippingCompanyCode: "SAGAWA",
    useSandbox: true,
    fillMissingAddress: false,
    skuAsName: false,
    merchantCode: createAtobaraiMerchantCode("M123"),
    spCode: createAtobaraiSpCode("SP456"),
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

describe("AppRootConfig", () => {
  const config1 = AppChannelConfig.create({
    name: "Channel 1",
    id: "c1",
    shippingCompanyCode: "YAMATO",
    useSandbox: false,
    fillMissingAddress: true,
    skuAsName: true,
    merchantCode: createAtobaraiMerchantCode("M1"),
    spCode: createAtobaraiSpCode("SP1"),
    terminalId: createAtobaraiTerminalId("T1"),
  })._unsafeUnwrap();
  const config2 = AppChannelConfig.create({
    name: "Channel 2",
    id: "c2",
    shippingCompanyCode: "SAGAWA",
    useSandbox: true,
    fillMissingAddress: false,
    skuAsName: false,
    merchantCode: createAtobaraiMerchantCode("M2"),
    spCode: createAtobaraiSpCode("SP2"),
    terminalId: createAtobaraiTerminalId("T2"),
  })._unsafeUnwrap();

  const chanelConfigMapping = {
    "channel-1": "c1",
    "channel-2": "c2",
    "channel-3": "c1",
  };
  const configsById = {
    c1: config1,
    c2: config2,
  };
  const rootConfig = new AppRootConfig(chanelConfigMapping, configsById);

  it("should return all configs as a list", () => {
    const configs = rootConfig.getAllConfigsAsList();

    expect(configs).toContain(config1);
    expect(configs).toContain(config2);
    expect(configs.length).toBe(2);
  });

  it("should return channels bound to a given config", () => {
    const channelsForC1 = rootConfig.getChannelsBoundToGivenConfig("c1");

    expect(channelsForC1).toStrictEqual(["channel-1", "channel-3"]);
    const channelsForC2 = rootConfig.getChannelsBoundToGivenConfig("c2");

    expect(channelsForC2).toStrictEqual(["channel-2"]);
  });
});
