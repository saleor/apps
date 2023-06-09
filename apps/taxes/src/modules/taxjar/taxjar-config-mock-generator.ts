import { TaxJarConfig } from "./taxjar-connection-schema";

export const defaultTaxJarConfig: TaxJarConfig = {
  name: "",
  isSandbox: false,
  credentials: {
    apiKey: "topSecretApiKey",
  },
  address: {
    city: "",
    country: "",
    state: "",
    street: "",
    zip: "",
  },
};

const testingScenariosMap = {
  default: defaultTaxJarConfig,
};

export class TaxJarConfigMockGenerator {
  constructor(private scenario: keyof typeof testingScenariosMap = "default") {}

  generateTaxJarConfig = (overrides: Partial<TaxJarConfig> = {}): TaxJarConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario],
      ...overrides,
    });
}
