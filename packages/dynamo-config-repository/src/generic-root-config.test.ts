import { describe, expect, it } from "vitest";

import { GenericRootConfig } from "./generic-root-config";
import { BaseConfig } from "./types";

const configs = {
  config1: { id: "config1", name: "Config 1" },
  config2: { id: "config2", name: "Config 2" },
};

const channelConfigMapping = {
  channelA: "config1",
  channelB: "config1",
  channelC: "config2",
};

type TestConfig = BaseConfig & { name: string };

describe("GenericRootConfig", () => {
  const rootConfig = new GenericRootConfig<TestConfig>({
    chanelConfigMapping: channelConfigMapping,
    configsById: configs,
  });

  it("getAllConfigsAsList returns all configs", () => {
    expect(rootConfig.getAllConfigsAsList()).toStrictEqual([
      { id: "config1", name: "Config 1" },
      { id: "config2", name: "Config 2" },
    ]);
  });

  it("getChannelsBoundToGivenConfig returns correct channels", () => {
    expect(rootConfig.getChannelsBoundToGivenConfig("config1")).toStrictEqual([
      "channelA",
      "channelB",
    ]);
    expect(rootConfig.getChannelsBoundToGivenConfig("config2")).toStrictEqual(["channelC"]);
  });

  it("getConfigByChannelId returns correct config", () => {
    expect(rootConfig.getConfigByChannelId("channelA")).toStrictEqual({
      id: "config1",
      name: "Config 1",
    });
    expect(rootConfig.getConfigByChannelId("channelC")).toStrictEqual({
      id: "config2",
      name: "Config 2",
    });
  });

  it("getConfigById returns correct config", () => {
    expect(rootConfig.getConfigById("config1")).toStrictEqual({
      id: "config1",
      name: "Config 1",
    });
    expect(rootConfig.getConfigById("config2")).toStrictEqual({
      id: "config2",
      name: "Config 2",
    });
  });
});
