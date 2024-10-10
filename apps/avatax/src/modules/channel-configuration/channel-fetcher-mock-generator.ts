import { ChannelFragmentType } from "../../../graphql/fragments/Channel";

const defaultChannel: ChannelFragmentType = {
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

  generateChannel = (overrides: Partial<ChannelFragmentType> = {}): ChannelFragmentType =>
    structuredClone({
      ...testingScenariosMap[this.scenario],
      ...overrides,
    });
}
