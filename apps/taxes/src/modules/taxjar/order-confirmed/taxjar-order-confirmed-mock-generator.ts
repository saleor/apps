import { CreateOrderRes } from "taxjar/dist/types/returnTypes";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { defaultOrder } from "../../../mocks";
import { ChannelConfig } from "../../channel-configuration/channel-config";
import { ChannelConfigMockGenerator } from "../../channel-configuration/channel-config-mock-generator";
import { TaxJarConfig } from "../taxjar-connection-schema";

type Order = OrderConfirmedSubscriptionFragment;

// providerConfigMockGenerator class that other classes extend?
const defaultProviderConfig: TaxJarConfig = {
  name: "taxjar-1",
  credentials: {
    apiKey: "test",
  },
  isSandbox: false,
  address: {
    country: "US",
    zip: "95008",
    state: "CA",
    city: "Campbell",
    street: "33 N. First Street",
  },
};

const defaultOrderConfirmedResponse: CreateOrderRes = {
  order: {
    user_id: 314973,
    transaction_reference_id: null,
    transaction_id: "T3JkZXI6ZTUzZTBlM2MtMjk5Yi00OWYxLWIyZDItY2Q4NWExYTgxYjY2",
    transaction_date: "2023-05-25T09:18:55.203Z",
    to_zip: "94111",
    to_street: "600 Montgomery St",
    to_state: "CA",
    to_country: "US",
    to_city: "SAN FRANCISCO",
    shipping: 59.17,
    sales_tax: 0.0,
    provider: "api",
    line_items: [
      {
        unit_price: 20.0,
        sales_tax: 5.18,
        quantity: 3,
        product_tax_code: "",
        product_identifier: "328223580",
        id: "0",
        discount: 0.0,
        description: "Monospace Tee",
      },
      {
        unit_price: 20.0,
        sales_tax: 1.73,
        quantity: 1,
        product_tax_code: "",
        product_identifier: "328223581",
        id: "1",
        discount: 0.0,
        description: "Monospace Tee",
      },
      {
        unit_price: 50.0,
        sales_tax: 8.63,
        quantity: 2,
        product_tax_code: "",
        product_identifier: "118223581",
        id: "2",
        discount: 0.0,
        description: "Paul's Balance 420",
      },
    ],
    from_zip: "95008",
    from_street: "33 N. First Street",
    from_state: "CA",
    from_country: "US",
    from_city: "CAMPBELL",
    exemption_type: null,
    amount: 239.17,
  },
};

const testingScenariosMap = {
  default: {
    order: defaultOrder,
    response: defaultOrderConfirmedResponse,
    providerConfig: defaultProviderConfig,
  },
};

type TestingScenario = keyof typeof testingScenariosMap;

export class TaxJarOrderConfirmedMockGenerator {
  constructor(private scenario: TestingScenario = "default") {}
  generateOrder = (overrides: Partial<Order> = {}): Order =>
    structuredClone({
      ...testingScenariosMap[this.scenario].order,
      ...overrides,
    });

  generateChannelConfig = (overrides: Partial<ChannelConfig> = {}): ChannelConfig => {
    const mockGenerator = new ChannelConfigMockGenerator();

    return mockGenerator.generateChannelConfig(overrides);
  };

  generateResponse = (overrides: Partial<CreateOrderRes> = {}): CreateOrderRes =>
    structuredClone({
      ...testingScenariosMap[this.scenario].response,
      ...overrides,
    });

  generateProviderConfig = (overrides: Partial<TaxJarConfig> = {}): TaxJarConfig =>
    structuredClone({
      ...testingScenariosMap[this.scenario].providerConfig,
      ...overrides,
    });
}
