import { describe, expect, it } from "vitest";

import { AvataxConfigMockGenerator } from "./avatax-config-mock-generator";
import { AvataxObfuscator } from "./avatax-obfuscator";

const mockAvataxConfig = new AvataxConfigMockGenerator().generateAvataxConfig();
const obfuscator = new AvataxObfuscator();

describe("AvataxObfuscator", () => {
  it("obfuscated avatax config", () => {
    const obfuscatedConfig = obfuscator.obfuscateAvataxConfig(mockAvataxConfig);

    expect(obfuscatedConfig).toStrictEqual({
      ...mockAvataxConfig,
      credentials: {
        password: "****word",
        username: "****name",
      },
    });
  });
  it("filters out obfuscated", () => {
    const obfuscatedConfig = obfuscator.obfuscateAvataxConfig(mockAvataxConfig);
    const { credentials, ...rest } = obfuscatedConfig;

    const filteredConfig = obfuscator.filterOutObfuscated(obfuscatedConfig);

    expect(filteredConfig).toStrictEqual(rest);
  });
  it("filters out username when is obfuscated", () => {
    const filteredConfig = obfuscator.filterOutObfuscated({
      ...mockAvataxConfig,
      credentials: {
        password: "password",
        username: "****name",
      },
    });

    expect(filteredConfig).toStrictEqual({
      ...mockAvataxConfig,
      credentials: {
        password: "password",
      },
    });
  });

  it("filters out password when is obfuscated", () => {
    const filteredConfig = obfuscator.filterOutObfuscated({
      ...mockAvataxConfig,
      credentials: {
        password: "****word",
        username: "username",
      },
    });

    expect(filteredConfig).toStrictEqual({
      ...mockAvataxConfig,
      credentials: {
        username: "username",
      },
    });
  });
});
