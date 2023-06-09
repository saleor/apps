import { ChannelConfig } from "./channel-config";

const defaultChannelConfig: ChannelConfig = {
  id: "1",
  config: {
    providerConnectionId: "aa5293e5-7f5d-4782-a619-222ead918e50",
    slug: "default-channel",
  },
};

const testingScenariosMap = {
  default: defaultChannelConfig,
};

type TestingScenario = keyof typeof testingScenariosMap;

export class ChannelConfigMockGenerator {
  constructor(private scenario: TestingScenario = "default") {}

  generateChannelConfig = (overrides: Partial<ChannelConfig> = {}): ChannelConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario],
      ...overrides,
    });
}
