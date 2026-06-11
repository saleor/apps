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
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";

const otherSaleorApiUrl = createSaleorApiUrl("https://other.saleor.cloud/graphql/")._unsafeUnwrap();

const buildConfig = (id: string) =>
  StripeConfig.create({
    publishableKey: mockedStripePublishableKey,
    name: `Config ${id}`,
    webhookId: `we_${id}`,
    restrictedKey: mockedStripeRestrictedKey,
    webhookSecret: mockStripeWebhookSecret,
    id,
  })._unsafeUnwrap();

describe("AppConfigRepo removeAll* / getAllConfigs integration", () => {
  const repo = new DynamodbAppConfigRepo({
    entities: {
      channelConfigMapping: DynamoDbChannelConfigMapping.entity,
      stripeConfig: DynamoDbStripeConfig.entity,
    },
    encryptor: mockEncryptor,
  });

  beforeEach(async () => {
    const root = await repo.getRootConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(root._unsafeUnwrap().stripeConfigsById).toStrictEqual({});
    expect(root._unsafeUnwrap().chanelConfigMapping).toStrictEqual({});
  });

  it("getAllConfigs returns every StripeConfig for the (saleorApiUrl, appId) tuple, decrypted", async () => {
    const id1 = new RandomId().generate();
    const id2 = new RandomId().generate();

    await repo.saveStripeConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: buildConfig(id1),
    });
    await repo.saveStripeConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: buildConfig(id2),
    });

    const result = await repo.getAllConfigs({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    const configs = result._unsafeUnwrap();

    expect(configs).toHaveLength(2);
    expect(configs.map((c) => c.id).sort()).toStrictEqual([id1, id2].sort());
    // verify decryption ran (restricted key roundtrips back to the plaintext mock value)
    expect(configs[0].restrictedKey).toStrictEqual(mockedStripeRestrictedKey);
  });

  it("removeAllConfigs deletes only configs for the given tenant; other tenants are untouched", async () => {
    const tenantA = buildConfig(new RandomId().generate());
    const tenantB = buildConfig(new RandomId().generate());

    await repo.saveStripeConfig({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: tenantA,
    });
    await repo.saveStripeConfig({
      saleorApiUrl: otherSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: tenantB,
    });

    const result = await repo.removeAllConfigs({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(result.isOk()).toBe(true);

    const remainingA = await repo.getAllConfigs({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });
    const remainingB = await repo.getAllConfigs({
      saleorApiUrl: otherSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(remainingA._unsafeUnwrap()).toHaveLength(0);
    expect(remainingB._unsafeUnwrap()).toHaveLength(1);
    expect(remainingB._unsafeUnwrap()[0].id).toStrictEqual(tenantB.id);
  });

  it("removeAllChannelMappings deletes only mappings for the given tenant; other tenants are untouched", async () => {
    const channelId = mockedSaleorChannelId;
    const otherChannelId = "Q2hhbm5lbDoy";
    const someConfigId = new RandomId().generate();

    await repo.updateMapping(
      { saleorApiUrl: mockedSaleorApiUrl, appId: mockedSaleorAppId },
      { channelId, configId: someConfigId },
    );
    await repo.updateMapping(
      { saleorApiUrl: otherSaleorApiUrl, appId: mockedSaleorAppId },
      { channelId: otherChannelId, configId: someConfigId },
    );

    const result = await repo.removeAllChannelMappings({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(result.isOk()).toBe(true);

    const rootA = (
      await repo.getRootConfig({
        saleorApiUrl: mockedSaleorApiUrl,
        appId: mockedSaleorAppId,
      })
    )._unsafeUnwrap();
    const rootB = (
      await repo.getRootConfig({
        saleorApiUrl: otherSaleorApiUrl,
        appId: mockedSaleorAppId,
      })
    )._unsafeUnwrap();

    expect(rootA.chanelConfigMapping).toStrictEqual({});
    expect(rootB.chanelConfigMapping[otherChannelId]).toStrictEqual(someConfigId);
  });

  it("removeAllConfigs is a no-op on an empty partition", async () => {
    const result = await repo.removeAllConfigs({
      saleorApiUrl: mockedSaleorApiUrl,
      appId: mockedSaleorAppId,
    });

    expect(result.isOk()).toBe(true);
  });
});
