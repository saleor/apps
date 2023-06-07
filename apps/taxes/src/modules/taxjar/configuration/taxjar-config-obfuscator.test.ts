import { TaxJarConfigMockGenerator } from "../taxjar-config-mock-generator";
import { TaxJarConfigObfuscator } from "./taxjar-config-obfuscator";
import { expect, it, describe } from "vitest";

const mockTaxJarConfig = new TaxJarConfigMockGenerator().generateTaxJarConfig();
const obfuscator = new TaxJarConfigObfuscator();

describe("TaxJarConfigObfuscator", () => {
  it("obfuscated taxjar config", () => {
    const obfuscatedConfig = obfuscator.obfuscateTaxJarConfig(mockTaxJarConfig);

    expect(obfuscatedConfig).toEqual({
      ...mockTaxJarConfig,
      credentials: {
        apiKey: "***********iKey",
      },
    });
  });
  it("filters out obfuscated", () => {
    const obfuscatedConfig = obfuscator.obfuscateTaxJarConfig(mockTaxJarConfig);
    const { credentials, ...rest } = obfuscatedConfig;

    const filteredConfig = obfuscator.filterOutObfuscated(obfuscatedConfig);

    expect(filteredConfig).toEqual(rest);
  });
});
