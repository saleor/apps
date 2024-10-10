import { TransactionModel } from "avatax/lib/models/TransactionModel";

import { defaultOrder } from "../../../mocks";
import { ChannelConfig } from "../../channel-configuration/channel-config";
import { AvataxConfigMockGenerator } from "../avatax-config-mock-generator";
import { AvataxConfig } from "../avatax-connection-schema";
import { orderConfirmedTransactionMock } from "./avatax-order-confirmed-response-transaction-mock";

const defaultChannelConfig: ChannelConfig = {
  id: "1",
  config: {
    providerConnectionId: "aa5293e5-7f5d-4782-a619-222ead918e50",
    slug: "default-channel",
  },
};

const defaultOrderConfirmedResponse: TransactionModel = orderConfirmedTransactionMock;

const testingScenariosMap = {
  default: {
    order: defaultOrder,
    channelConfig: defaultChannelConfig,
    response: defaultOrderConfirmedResponse,
  },
};

type TestingScenario = keyof typeof testingScenariosMap;

export class AvataxOrderConfirmedMockGenerator {
  constructor(private scenario: TestingScenario = "default") {}

  generateAvataxConfig = (overrides: Partial<AvataxConfig> = {}): AvataxConfig => {
    const mockGenerator = new AvataxConfigMockGenerator();

    return mockGenerator.generateAvataxConfig(overrides);
  };
}
