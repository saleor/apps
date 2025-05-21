import { testApiHandler } from "next-test-api-route-handler";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import * as manifestHandlers from "@/app/api/webhooks/saleor/payment-gateway-initialize-session/route";
import * as verifyWebhookSignatureModule from "@/app/api/webhooks/saleor/verify-signature";
import { PaymentGatewayInitializeSessionEventFragment } from "@/generated/graphql";
import { Encryptor } from "@/lib/encryptor";
import { RandomId } from "@/lib/random-id";
import { dynamoDbAplEntity } from "@/modules/apl/apl-db-model";
import { DynamoAPLRepository } from "@/modules/apl/dynamo-apl-repository";
import { DynamoAPL } from "@/modules/apl/dynamodb-apl";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";

const realSaleorApiUrl = createSaleorApiUrl(
  "https://hackathon-shipping.eu.saleor.cloud/graphql/",
)._unsafeUnwrap();

const randomId = new RandomId().generate();

const repo = new DynamodbAppConfigRepo({
  entities: {
    channelConfigMapping: DynamoDbChannelConfigMapping.entity,
    stripeConfig: DynamoDbStripeConfig.entity,
  },
  encryptor: new Encryptor(),
});

const apl = new DynamoAPL({
  repository: new DynamoAPLRepository({
    entity: dynamoDbAplEntity,
  }),
});

describe("PaymentGatewayInitialize webhook: integration", async () => {
  beforeEach(async () => {
    vi.spyOn(verifyWebhookSignatureModule, "verifyWebhookSignature").mockImplementation(
      async () => {},
    );

    await apl.set({
      saleorApiUrl: realSaleorApiUrl,
      appId: mockedSaleorAppId,
      token: "mocked-token",
      jwks: "{}",
    });

    await repo.saveStripeConfig({
      saleorApiUrl: realSaleorApiUrl,
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

    await repo.updateMapping(
      {
        saleorApiUrl: realSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      {
        configId: randomId,
        channelId: mockedSaleorChannelId,
      },
    );
  });

  /**
   * Verify snapshot - if your changes cause manifest to be different, ensure changes are expected
   */
  it("Returns response with stored publishable key from the config", async () => {
    // TODO: Why we pass it directly, should subscription resolve to have event {} first? (todo check api response in logs)
    const eventPayload = {
      sourceObject: {
        __typename: "Checkout",
        channel: {
          slug: "default-channel",
          id: mockedSaleorChannelId,
        },
        id: "checkout-id",
      },
      recipient: {
        id: mockedSaleorAppId,
      },
    } satisfies PaymentGatewayInitializeSessionEventFragment;

    await testApiHandler({
      appHandler: manifestHandlers,
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify(eventPayload),
          headers: new Headers({
            "saleor-api-url": realSaleorApiUrl,
            "saleor-event": "payment_gateway_initialize_session",
            "saleor-signature": "mock-signature",
          }),
        });

        const body = await response.json();

        expect(body).toStrictEqual({ data: { stripePublishableKey: "pk_live_1" } });

        expect(response.status).toStrictEqual(200);
      },
    });
  });
});
