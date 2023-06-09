import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channel-configuration/channel-config";
import { orderCreatedTransactionMock } from "./avatax-order-created-response-transaction-mock";
import { AvataxConfig } from "../avatax-connection-schema";
import { defaultOrder } from "../../../mocks";
import { AvataxConfigMockGenerator } from "../avatax-config-mock-generator";

const defaultChannelConfig: ChannelConfig = {
  id: "1",
  config: {
    providerConnectionId: "aa5293e5-7f5d-4782-a619-222ead918e50",
    slug: "default-channel",
  },
};

const defaultOrderCreatedResponse: TransactionModel = orderCreatedTransactionMock;

const testingScenariosMap = {
  default: {
    order: defaultOrder,
    channelConfig: defaultChannelConfig,
    response: defaultOrderCreatedResponse,
  },
};

type TestingScenario = keyof typeof testingScenariosMap;

export class AvataxOrderCreatedMockGenerator {
  constructor(private scenario: TestingScenario = "default") {}
  generateOrder = (
    overrides: Partial<OrderCreatedSubscriptionFragment> = {}
  ): OrderCreatedSubscriptionFragment =>
    structuredClone({
      ...testingScenariosMap[this.scenario].order,
      ...overrides,
    });

  generateChannelConfig = (overrides: Partial<ChannelConfig> = {}): ChannelConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario].channelConfig,
      ...overrides,
    });

  generateAvataxConfig = (overrides: Partial<AvataxConfig> = {}): AvataxConfig => {
    const mockGenerator = new AvataxConfigMockGenerator();

    return mockGenerator.generateAvataxConfig(overrides);
  };

  generateResponse = (overrides: Partial<TransactionModel> = {}): TransactionModel =>
    structuredClone({
      ...testingScenariosMap[this.scenario].response,
      ...overrides,
    });
}
