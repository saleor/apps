import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { OrderCreatedSubscriptionFragment } from "../../../../generated/graphql";
import { ChannelConfig } from "../../channels-configuration/channels-config";
import { orderCreatedTransactionMock } from "./avatax-order-created-response-transaction-mock";
import { AvataxConfig } from "../avatax-config";
import { defaultOrder } from "../../../mocks";

const defaultChannelConfig: ChannelConfig = {
  providerInstanceId: "aa5293e5-7f5d-4782-a619-222ead918e50",
};

const defaultOrderCreatedResponse: TransactionModel = orderCreatedTransactionMock;

const defaultAvataxConfig: AvataxConfig = {
  companyCode: "DEFAULT",
  isAutocommit: false,
  isSandbox: true,
  name: "Avatax-1",
  shippingTaxCode: "FR000000",
  address: {
    country: "US",
    zip: "95008",
    state: "CA",
    city: "Campbell",
    street: "33 N. First Street",
  },
  credentials: {
    password: "password",
    username: "username",
  },
};

const testingScenariosMap = {
  default: {
    order: defaultOrder,
    channelConfig: defaultChannelConfig,
    response: defaultOrderCreatedResponse,
    avataxConfig: defaultAvataxConfig,
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

  generateAvataxConfig = (overrides: Partial<AvataxConfig> = {}): AvataxConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario].avataxConfig,
      ...overrides,
    });

  generateResponse = (overrides: Partial<TransactionModel> = {}): TransactionModel =>
    structuredClone({
      ...testingScenariosMap[this.scenario].response,
      ...overrides,
    });
}
