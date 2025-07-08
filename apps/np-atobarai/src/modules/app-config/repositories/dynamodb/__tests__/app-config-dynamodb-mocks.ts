import {
  mockedConfigurationId,
  mockedSaleorAppId,
  mockedSaleorChannelId,
} from "@/__tests__/mocks/constants";
import { mockEncryptor } from "@/__tests__/mocks/mock-encryptor";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";

const mockedStripeConfig = {
  configName: "tasdafsdf",
  createdAt: "2025-04-25T09:19:13.402Z",
  stripeWhId: "we_1RHiPdKFxIUko8m01KAnXiRQ",
  configId: mockedConfigurationId,
  stripePk:
    "pk_test_51Ng2yKKFxIUko8m0IUBO8GvarTlXcNIpAATM9cE7S2GaoFLsTAsn5avHHjfLFVKewqTFwMb2wqOP87CEbgwljzf200aXXm38oM",
  modifiedAt: "2025-04-25T09:19:13.402Z",
  stripeWhSecret: mockEncryptor.encrypt("whsec_ZOsiN376Ahfo0N8lWg7PYXNGpnDXShS5"),
  SK: `CONFIG_ID#${mockedConfigurationId}`,
  stripeRk: mockEncryptor.encrypt(
    "rk_test_51Ng2yKKFxIUko8m0eaadRYweTPBGnnBA58rpt5JQ7Y7VqSBnQu39JHWoqMfd5lSxH9OH44Bm5NMOQkbzpaMdjD3v00VsW1DGyx",
  ),
  PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
  _et: "StripeConfig",
};

const mockedMapping = {
  createdAt: "2025-04-25T10:26:30.219Z",
  configId: mockedConfigurationId,
  modifiedAt: "2025-04-25T10:26:30.219Z",
  SK: `CHANNEL_ID#${mockedSaleorChannelId}`,
  PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
  channelId: mockedSaleorChannelId,
  _et: "ChannelConfigMapping",
};

export const mockedDynamoConfigItems = {
  mockedStripeConfig,
  mockedMapping,
};
