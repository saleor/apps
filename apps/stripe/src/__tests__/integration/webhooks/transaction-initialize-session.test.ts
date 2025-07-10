import { DynamoAPL } from "@saleor/apl-dynamo";
import { Encryptor } from "@saleor/apps-shared/encryptor";
import { testApiHandler } from "next-test-api-route-handler";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { transactionInitializeSessionFixture } from "@/__tests__/integration/webhooks/fixtures/transaction-initialize-session-fixture";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import * as initializeSessionHandlers from "@/app/api/webhooks/saleor/transaction-initialize-session/route";
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
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

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

describe("TransactionInitializeSession webhook: integration", async () => {
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
        publishableKey: createStripePublishableKey(env.INTEGRATION_STRIPE_PK)._unsafeUnwrap(),
        name: "Config name",
        webhookId: "we_123",
        restrictedKey: createStripeRestrictedKey(env.INTEGRATION_STRIPE_RK)._unsafeUnwrap(),
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

  it("Returns response with CHARGE_ACTION_REQUIRED and client secret in data", async () => {
    await testApiHandler({
      appHandler: initializeSessionHandlers,
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify(transactionInitializeSessionFixture()),
          headers: new Headers({
            "saleor-api-url": realSaleorApiUrl,
            "saleor-event": "transaction_initialize_session",
            "saleor-signature": "mock-signature",
          }),
        });

        const body = await response.json();

        expect(body).toStrictEqual({
          data: {
            paymentIntent: {
              stripeClientSecret: expect.stringContaining("pi_"),
            },
          },
          actions: ["CANCEL"],
          result: "CHARGE_ACTION_REQUIRED",
          amount: 123.3,
          pspReference: expect.stringContaining("pi_"),
          message: "Payment intent requires payment method",
          externalUrl: expect.stringContaining("https://dashboard.stripe.com/test/payments/pi_"),
        });

        expect(response.status).toStrictEqual(200);
      },
    });
  });
});
