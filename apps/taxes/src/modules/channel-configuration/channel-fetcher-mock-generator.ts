import { ChannelFragment } from "../../../generated/graphql";

const defaultChannel: ChannelFragment = {
  id: "1",
  name: "Default Channel",
  slug: "default-channel",
};

const testingScenariosMap = {
  default: defaultChannel,
};

type TestingScenario = keyof typeof testingScenariosMap;

export class ChannelFetcherMockGenerator {
  constructor(private scenario: TestingScenario = "default") {}

  generateChannel = (overrides: Partial<ChannelFragment> = {}): ChannelFragment =>
    structuredClone({
      ...testingScenariosMap[this.scenario],
      ...overrides,
    });
}
