import { createLogger } from "vite";
import { beforeEach, describe, expect, it } from "vitest";

import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockEncryptor } from "@/__tests__/mocks/mock-encryptor";
import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import { RandomId } from "@/lib/random-id";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";

const testLogger = createLogger();

describe("ConfigRepo with DynamoDB integration test", () => {
  const repo = new DynamodbAppConfigRepo({
    entities: {
      channelConfigMapping: DynamoDbChannelConfigMapping.entity,
      stripeConfig: DynamoDbStripeConfig.entity,
    },
    encryptor: mockEncryptor,
  });

  beforeEach(async () => {
    const stripeConfig = await repo.getRootConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    /**
     * Ensure DB is clean before each test
     */
    expect(stripeConfig._unsafeUnwrap().stripeConfigsById).toStrictEqual({});
    expect(stripeConfig._unsafeUnwrap().chanelConfigMapping).toStrictEqual({});
  });

  it("Creates and reads a configuration", async () => {
    // keep it random, so we additionally check that DB has dynamic value, not some leftover
    const randomId = new RandomId().generate();

    testLogger.info(`Will write config with ID: ${randomId}`);

    await repo.saveStripeConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: StripeConfig.create({
        publishableKey: mockedStripePublishableKey,
        name: "Config name",
        webhookId: "we_123",
        restrictedKey: mockedStripeRestrictedKey,
        webhookSecret: mockStripeWebhookSecret,
        id: randomId,
      })._unsafeUnwrap(),
    });

    testLogger.info(`Attempting to read config with ID: ${randomId}`);

    const stripeConfig = await repo.getStripeConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      configId: randomId,
    });

    expect(stripeConfig.isOk()).toBe(true);
    testLogger.info(`Read config with ID: ${stripeConfig._unsafeUnwrap()?.id}`);
    expect(stripeConfig._unsafeUnwrap()?.id).toStrictEqual(randomId);
  });

  it("Creates 2 configurations, then assigns them sequentially to channel", async () => {
    // Given

    const channelId = mockedSaleorChannelId;
    const config1id = new RandomId().generate();
    const config2id = new RandomId().generate();

    await repo.saveStripeConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: StripeConfig.create({
        publishableKey: mockedStripePublishableKey,
        name: "Config name",
        webhookId: "we_123",
        restrictedKey: mockedStripeRestrictedKey,
        webhookSecret: mockStripeWebhookSecret,
        id: config1id,
      })._unsafeUnwrap(),
    });

    await repo.saveStripeConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: StripeConfig.create({
        publishableKey: mockedStripePublishableKey,
        name: "Config name",
        webhookId: "we_123",
        restrictedKey: mockedStripeRestrictedKey,
        webhookSecret: mockStripeWebhookSecret,
        id: config2id,
      })._unsafeUnwrap(),
    });

    const currentMapping = await repo.getRootConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(currentMapping.isOk()).toBe(true);

    const unpackedMapping = currentMapping._unsafeUnwrap();

    // Assert it's empty
    expect(unpackedMapping.chanelConfigMapping).toStrictEqual({});

    await repo.updateMapping(
      {
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      {
        configId: config1id,
        channelId,
      },
    );

    const newMappingAfterFirstWrite = (
      await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      })
    )._unsafeUnwrap();

    expect(newMappingAfterFirstWrite.chanelConfigMapping[channelId]).toStrictEqual(config1id);

    await repo.updateMapping(
      {
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      {
        configId: config2id,
        channelId,
      },
    );

    const newMappingAfterSecondWrite = (
      await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      })
    )._unsafeUnwrap();

    expect(newMappingAfterSecondWrite.chanelConfigMapping[channelId]).toStrictEqual(config2id);
  });

  it("Creates config and removes it", async () => {
    const config1id = new RandomId().generate();

    await repo.saveStripeConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: StripeConfig.create({
        publishableKey: mockedStripePublishableKey,
        name: "Config name",
        webhookId: "we_123",
        restrictedKey: mockedStripeRestrictedKey,
        webhookSecret: mockStripeWebhookSecret,
        id: config1id,
      })._unsafeUnwrap(),
    });

    const rootConfig = (
      await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      })
    )._unsafeUnwrap();

    // Verify if data written first
    expect(rootConfig.stripeConfigsById[config1id]).toBeDefined();

    /*
     * WHEN
     * Remove the config
     */
    await repo.removeConfig(
      {
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      {
        configId: config1id,
      },
    );

    const rootConfigRefetched = (
      await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      })
    )._unsafeUnwrap();

    // Assert only config removal. Mapping is handled by separate command
    expect(rootConfigRefetched.stripeConfigsById[config1id]).toBeUndefined();
  });

  it("Sets mapping and deletes it", async () => {
    const channelId = mockedSaleorChannelId;
    const config1id = new RandomId().generate();

    await repo.updateMapping(
      {
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      {
        // config doesn't have to exist at this point
        configId: config1id,
        channelId,
      },
    );

    const rootConfig = (
      await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      })
    )._unsafeUnwrap();

    // Verify if data written first
    expect(rootConfig.getChannelsBoundToGivenConfig(config1id)).toStrictEqual([channelId]);

    /*
     * WHEN
     * Remove the config
     */
    await repo.updateMapping(
      {
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      {
        channelId,
        configId: null,
      },
    );

    const rootConfigRefetched = (
      await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      })
    )._unsafeUnwrap();

    expect(rootConfigRefetched.getChannelsBoundToGivenConfig(config1id)).toStrictEqual([]);
  });
});
