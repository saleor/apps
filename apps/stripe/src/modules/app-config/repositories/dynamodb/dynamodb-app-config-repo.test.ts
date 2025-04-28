import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it } from "vitest";

import {
  mockedConfigurationId,
  mockedSaleorAppId,
  mockedSaleorChannelId,
} from "@/__tests__/mocks/constants";
import { mockedStripeConfig } from "@/__tests__/mocks/mock-stripe-config";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { AppRootConfig } from "@/modules/app-config/domain/app-root-config";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { AppConfigRepoError } from "@/modules/app-config/repositories/app-config-repo";
import { mockedDynamoConfigItems } from "@/modules/app-config/repositories/dynamodb/__tests__/app-config-dynamodb-mocks";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { DynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

describe("DynamodbAppConfigRepo", () => {
  let repo: DynamodbAppConfigRepo;

  const mockDocumentClient = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    mockDocumentClient.reset();

    const table = DynamoMainTable.create({
      // @ts-expect-error mocking DynamoDBDocumentClient
      documentClient: mockDocumentClient,
      tableName: "stripe-test-table",
    });

    const channelMappingEntity = DynamoDbChannelConfigMapping.createEntity(table);
    const stripeConfigEntity = DynamoDbStripeConfig.createEntity(table);

    repo = new DynamodbAppConfigRepo({
      entities: {
        stripeConfig: stripeConfigEntity,
        channelConfigMapping: channelMappingEntity,
      },
    });
  });

  describe("getRootConfig", () => {
    it("Returns valid RootAppConfig with entries from database", async () => {
      mockDocumentClient
        .on(QueryCommand, {
          ExpressionAttributeValues: {
            ":c0_1": "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
            ":c0_2": "CONFIG_ID#",
            ":c1_1": "StripeConfig",
          },
          KeyConditionExpression: "(#c0_1 = :c0_1) AND (begins_with(#c0_2, :c0_2))",
          FilterExpression: "#c1_1 = :c1_1",
          ExpressionAttributeNames: { "#c0_1": "PK", "#c0_2": "SK", "#c1_1": "_et" },
        })
        .resolvesOnce({
          Items: [
            mockedDynamoConfigItems.mockedStripeConfig,
            {
              ...mockedDynamoConfigItems.mockedStripeConfig,
              configId: "another-config-id",
            },
          ],
        });

      mockDocumentClient
        .on(QueryCommand, {
          KeyConditionExpression: "(#c0_1 = :c0_1) AND (begins_with(#c0_2, :c0_2))",
          FilterExpression: "#c1_1 = :c1_1",
          ExpressionAttributeNames: { "#c0_1": "PK", "#c0_2": "SK", "#c1_1": "_et" },
          ExpressionAttributeValues: {
            ":c0_1": "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
            ":c0_2": "CHANNEL_ID#",
            ":c1_1": "ChannelConfigMapping",
          },
        })
        .resolvesOnce({
          Items: [
            mockedDynamoConfigItems.mockedMapping,
            {
              ...mockedDynamoConfigItems.mockedMapping,
              channelId: "another-channel-id",
            },
          ],
        });

      const result = await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      });

      expect(result._unsafeUnwrap()).toBeInstanceOf(AppRootConfig);
      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        AppRootConfig {
          "chanelConfigMapping": {
            "Q2hhbm5lbDox": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
            "another-channel-id": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
          },
          "stripeConfigsById": {
            "81f323bd-91e2-4838-ab6e-5affd81ffc3b": StripeConfig {
              "id": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
              "name": "tasdafsdf",
              "publishableKey": "pk_test_51Ng2yKKFxIUko8m0IUBO8GvarTlXcNIpAATM9cE7S2GaoFLsTAsn5avHHjfLFVKewqTFwMb2wqOP87CEbgwljzf200aXXm38oM",
              "restrictedKey": "rk_test_51Ng2yKKFxIUko8m0eaadRYweTPBGnnBA58rpt5JQ7Y7VqSBnQu39JHWoqMfd5lSxH9OH44Bm5NMOQkbzpaMdjD3v00VsW1DGyx",
              "webhookId": "we_1RHiPdKFxIUko8m01KAnXiRQ",
              "webhookSecret": "whsec_ZOsiN376Ahfo0N8lWg7PYXNGpnDXShS5",
            },
            "another-config-id": StripeConfig {
              "id": "another-config-id",
              "name": "tasdafsdf",
              "publishableKey": "pk_test_51Ng2yKKFxIUko8m0IUBO8GvarTlXcNIpAATM9cE7S2GaoFLsTAsn5avHHjfLFVKewqTFwMb2wqOP87CEbgwljzf200aXXm38oM",
              "restrictedKey": "rk_test_51Ng2yKKFxIUko8m0eaadRYweTPBGnnBA58rpt5JQ7Y7VqSBnQu39JHWoqMfd5lSxH9OH44Bm5NMOQkbzpaMdjD3v00VsW1DGyx",
              "webhookId": "we_1RHiPdKFxIUko8m01KAnXiRQ",
              "webhookSecret": "whsec_ZOsiN376Ahfo0N8lWg7PYXNGpnDXShS5",
            },
          },
        }
      `);
    });

    it("Returns FailureFetchingConfig if DB connection fails", async () => {
      const result = await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(AppConfigRepoError.FailureFetchingConfig);
      }
    });
  });

  describe("getStripeConfig", () => {
    it("Returns null if entry not found in DB", async () => {
      mockDocumentClient.on(GetCommand, {}).resolvesOnce({});

      const result = await repo.getStripeConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        configId: mockedConfigurationId,
      });

      expect(result._unsafeUnwrap()).toBeNull();
    });

    it("Returns valid StripeConfig if entry found in DB", async () => {
      mockDocumentClient.on(GetCommand, {}).resolvesOnce({
        Item: mockedDynamoConfigItems.mockedStripeConfig,
      });

      const result = await repo.getStripeConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        configId: mockedConfigurationId,
      });

      expect(result._unsafeUnwrap()).toBeInstanceOf(StripeConfig);
      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeConfig {
          "id": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
          "name": "tasdafsdf",
          "publishableKey": "pk_test_51Ng2yKKFxIUko8m0IUBO8GvarTlXcNIpAATM9cE7S2GaoFLsTAsn5avHHjfLFVKewqTFwMb2wqOP87CEbgwljzf200aXXm38oM",
          "restrictedKey": "rk_test_51Ng2yKKFxIUko8m0eaadRYweTPBGnnBA58rpt5JQ7Y7VqSBnQu39JHWoqMfd5lSxH9OH44Bm5NMOQkbzpaMdjD3v00VsW1DGyx",
          "webhookId": "we_1RHiPdKFxIUko8m01KAnXiRQ",
          "webhookSecret": "whsec_ZOsiN376Ahfo0N8lWg7PYXNGpnDXShS5",
        }
      `);
    });

    it("Returns valid StripeConfig when queried by channelId", async () => {
      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
            SK: `CONFIG_ID#${mockedConfigurationId}`,
          },
        })
        .resolvesOnce({
          Item: mockedDynamoConfigItems.mockedStripeConfig,
        });

      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
            SK: `CHANNEL_ID#${mockedSaleorChannelId}`,
          },
        })
        .resolvesOnce({
          Item: mockedDynamoConfigItems.mockedMapping,
        });

      const result = await repo.getStripeConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        channelId: mockedSaleorChannelId,
      });

      expect(result._unsafeUnwrap()).toBeInstanceOf(StripeConfig);
      expect(result._unsafeUnwrap()).toMatchInlineSnapshot(`
        StripeConfig {
          "id": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
          "name": "tasdafsdf",
          "publishableKey": "pk_test_51Ng2yKKFxIUko8m0IUBO8GvarTlXcNIpAATM9cE7S2GaoFLsTAsn5avHHjfLFVKewqTFwMb2wqOP87CEbgwljzf200aXXm38oM",
          "restrictedKey": "rk_test_51Ng2yKKFxIUko8m0eaadRYweTPBGnnBA58rpt5JQ7Y7VqSBnQu39JHWoqMfd5lSxH9OH44Bm5NMOQkbzpaMdjD3v00VsW1DGyx",
          "webhookId": "we_1RHiPdKFxIUko8m01KAnXiRQ",
          "webhookSecret": "whsec_ZOsiN376Ahfo0N8lWg7PYXNGpnDXShS5",
        }
      `);
    });

    it("Returns null when channelId mapping not found", async () => {
      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
            SK: `CHANNEL_ID#${mockedSaleorChannelId}`,
          },
        })
        .resolvesOnce({});

      const result = await repo.getStripeConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        channelId: mockedSaleorChannelId,
      });

      expect(result._unsafeUnwrap()).toBeNull();
    });

    it("Returns FailureFetchingConfig if DB connection fails", async () => {
      mockDocumentClient
        .on(GetCommand, {
          Key: {
            PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
            SK: `CHANNEL_ID#${mockedSaleorChannelId}`,
          },
        })
        .resolvesOnce({
          $metadata: {
            httpStatusCode: 500,
          },
        });

      const result = await repo.getStripeConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
        configId: mockedConfigurationId,
      });

      expect(result._unsafeUnwrapErr()).toBeInstanceOf(AppConfigRepoError.FailureFetchingConfig);
    });
  });

  describe("saveStripeConfig", () => {
    it("Saves config to DB by calling method on entity", async () => {
      mockDocumentClient.on(PutCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 200,
        },
      });

      const result = await repo.saveStripeConfig({
        config: mockedStripeConfig,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      });

      expect(result.isOk()).toBe(true);

      /**
       * Assert args that are sent to DynamoDB
       */
      // @ts-expect-error - Item is not defined on mock
      expect(mockDocumentClient.calls()[0].args[0].input.Item).toMatchInlineSnapshot(
        {
          createdAt: expect.any(String),
          modifiedAt: expect.any(String),
        },
        `
        {
          "PK": "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
          "SK": "CONFIG_ID#81f323bd-91e2-4838-ab6e-5affd81ffc3b",
          "_et": "StripeConfig",
          "configId": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
          "configName": "config-name",
          "createdAt": Any<String>,
          "modifiedAt": Any<String>,
          "stripePk": "pk_live_1",
          "stripeRk": "rk_live_AAAAABBBBCCCCCEEEEEEEFFFFFGGGGG",
          "stripeWhId": "wh_123456789",
          "stripeWhSecret": "whsec_XYZ",
        }
      `,
      );
    });

    it("Returns FailureSavingConfig if DB connection fails", async () => {
      const result = await repo.saveStripeConfig({
        config: mockedStripeConfig,
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      });

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(AppConfigRepoError.FailureSavingConfig);
      }
    });
  });

  describe("updateMapping", () => {
    it("Saves config to DB by calling method on entity", async () => {
      mockDocumentClient.on(PutCommand, {}).resolvesOnce({
        $metadata: {
          httpStatusCode: 200,
        },
      });

      const result = await repo.updateMapping(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        {
          configId: mockedConfigurationId,
          channelId: mockedSaleorChannelId,
        },
      );

      expect(result.isOk()).toBe(true);

      /**
       * Assert args that are sent to DynamoDB
       */
      // @ts-expect-error - Item is not defined on mock
      expect(mockDocumentClient.calls()[0].args[0].input.Item).toMatchInlineSnapshot(
        {
          createdAt: expect.any(String),
          modifiedAt: expect.any(String),
        },
        `
        {
          "PK": "https://foo.bar.saleor.cloud/graphql/#saleor-app-id",
          "SK": "CHANNEL_ID#Q2hhbm5lbDox",
          "_et": "ChannelConfigMapping",
          "channelId": "Q2hhbm5lbDox",
          "configId": "81f323bd-91e2-4838-ab6e-5affd81ffc3b",
          "createdAt": Any<String>,
          "modifiedAt": Any<String>,
        }
      `,
      );
    });

    it("Returns FailureSavingConfig if DB connection fails", async () => {
      const result = await repo.updateMapping(
        {
          saleorApiUrl: mockedSaleorApiUrl,
          appId: mockedSaleorAppId,
        },
        {
          configId: mockedConfigurationId,
          channelId: mockedSaleorChannelId,
        },
      );

      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(AppConfigRepoError.FailureSavingConfig);
      }
    });
  });
});
