import { DynamoAPL } from "@saleor/apl-dynamo";
import { Encryptor } from "@saleor/apps-shared/encryptor";
import { testApiHandler } from "next-test-api-route-handler";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { paymentGatewayInitializeFixture } from "@/__tests__/integration/webhooks/fixtures/payment-gateway-initialize-fixture";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockedStripePublishableKey } from "@/__tests__/mocks/mocked-stripe-publishable-key";
import { mockedStripeRestrictedKey } from "@/__tests__/mocks/mocked-stripe-restricted-key";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import * as paymentGatewayInitializeSessionHandlers from "@/app/api/webhooks/saleor/payment-gateway-initialize-session/route";
import * as verifyWebhookSignatureModule from "@/app/api/webhooks/saleor/verify-signature";
import { createLogger } from "@/lib/logger";
import { RandomId } from "@/lib/random-id";
import { appInternalTracer } from "@/lib/tracing";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import { env } from "../env";

const realSaleorApiUrl = createSaleorApiUrl(env.INTEGRATION_SALEOR_API_URL)._unsafeUnwrap();

const configId = new RandomId().generate();

const repo = new DynamodbAppConfigRepo({
  entities: {
    channelConfigMapping: DynamoDbChannelConfigMapping.entity,
    stripeConfig: DynamoDbStripeConfig.entity,
  },
  encryptor: new Encryptor(env.SECRET_KEY),
});

const apl = DynamoAPL.create({
  logger: createLogger("Test logger"),
  table: dynamoMainTable,
  tracer: appInternalTracer,
  env: {
    AWS_SECRET_ACCESS_KEY: env.AWS_SECRET_ACCESS_KEY,
    APL_TABLE_NAME: env.DYNAMODB_MAIN_TABLE_NAME,
    AWS_REGION: env.AWS_REGION,
    AWS_ACCESS_KEY_ID: env.AWS_ACCESS_KEY_ID,
  },
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
        id: configId,
      })._unsafeUnwrap(),
    });

    await repo.updateMapping(
      {
        saleorApiUrl: realSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      {
        configId: configId,
        channelId: mockedSaleorChannelId,
      },
    );
  });

  it("Returns response with stored publishable key from the config", async () => {
    await testApiHandler({
      appHandler: paymentGatewayInitializeSessionHandlers,
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify(paymentGatewayInitializeFixture()),
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
