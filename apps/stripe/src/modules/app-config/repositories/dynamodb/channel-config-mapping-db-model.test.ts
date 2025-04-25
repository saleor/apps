import { Parser } from "dynamodb-toolbox";
import { describe, expect, it, vi } from "vitest";

import {
  mockedConfigurationId,
  mockedSaleorAppId,
  mockedSaleorChannelId,
} from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";

describe("DynamoDbChannelConfigMapping", () => {
  const saleorApiUrl = mockedSaleorApiUrl;
  const appId = mockedSaleorAppId;
  const channelId = mockedSaleorChannelId;

  describe("accessPattern", () => {
    it("generates primary key scoped to installation", () => {
      const pk = DynamoDbChannelConfigMapping.accessPattern.getPK({ saleorApiUrl, appId });

      expect(pk).toBe(`${saleorApiUrl}#${appId}`);
    });

    it("generates sort key for specific channel", () => {
      const sk = DynamoDbChannelConfigMapping.accessPattern.getSKforSpecificChannel({ channelId });

      expect(sk).toBe(`CHANNEL_ID#${channelId}`);
    });

    it("generates sort key prefix for all channels", () => {
      const sk = DynamoDbChannelConfigMapping.accessPattern.getSKforAllChannels();

      expect(sk).toBe("CHANNEL_ID#");
    });
  });

  describe("entitySchema", () => {
    it("Properly parses data and doesn't throw", () => {
      const schema = DynamoDbChannelConfigMapping.entitySchema;

      const result = schema.build(Parser).parse({
        PK: DynamoDbChannelConfigMapping.accessPattern.getPK({ saleorApiUrl, appId }),
        SK: DynamoDbChannelConfigMapping.accessPattern.getSKforSpecificChannel({ channelId }),
        channelId: channelId,
        configId: mockedConfigurationId,
      });

      expect(result).toMatchInlineSnapshot(`
        {
          "PK": "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
          "SK": "CHANNEL_ID#Q2hhbm5lbDox",
          "channelId": "Q2hhbm5lbDox",
          "configId": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
        }
      `);
    });
  });
});
