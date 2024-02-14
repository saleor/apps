import { TaxJarConfigMockGenerator } from "../taxjar-config-mock-generator";
import { TaxJarConnectionObfuscator } from "./taxjar-connection-obfuscator";
import { expect, it, describe } from "vitest";

const mockTaxJarConfig = new TaxJarConfigMockGenerator().generateTaxJarConfig();
const obfuscator = new TaxJarConnectionObfuscator();

describe("TaxJarConnectionObfuscator", () => {
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
