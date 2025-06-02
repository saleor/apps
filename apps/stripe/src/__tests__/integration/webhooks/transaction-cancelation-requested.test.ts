import { testApiHandler } from "next-test-api-route-handler";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockedSaleorAppId,
  mockedSaleorChannelId,
  mockedSaleorTransactionIdBranded,
} from "@/__tests__/mocks/constants";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import * as manifestHandlers from "@/app/api/webhooks/saleor/transaction-cancelation-requested/route";
import * as verifyWebhookSignatureModule from "@/app/api/webhooks/saleor/verify-signature";
import { Encryptor } from "@/lib/encryptor";
import { RandomId } from "@/lib/random-id";
import { dynamoDbAplEntity } from "@/modules/apl/apl-db-model";
import { DynamoAPLRepository } from "@/modules/apl/dynamo-apl-repository";
import { DynamoAPL } from "@/modules/apl/dynamodb-apl";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { DynamoDBTransactionRecorderRepo } from "@/modules/transactions-recording/repositories/dynamodb/dynamodb-transaction-recorder-repo";
import { DynamoDbRecordedTransaction } from "@/modules/transactions-recording/repositories/dynamodb/recorded-transaction-db-model";

import { env } from "../env";
import { transactionCancelationRequestedFixture } from "./fixtures/transaction-cancelation-requested-fixture";

const realSaleorApiUrl = createSaleorApiUrl(env.INTEGRATION_SALEOR_API_URL)._unsafeUnwrap();

const randomId = new RandomId().generate();

const configRepo = new DynamodbAppConfigRepo({
  entities: {
    channelConfigMapping: DynamoDbChannelConfigMapping.entity,
    stripeConfig: DynamoDbStripeConfig.entity,
  },
  encryptor: new Encryptor(),
});

const transactionRecorderRepo = new DynamoDBTransactionRecorderRepo({
  entity: DynamoDbRecordedTransaction.entity,
});

const apl = new DynamoAPL({
  repository: new DynamoAPLRepository({
    entity: dynamoDbAplEntity,
  }),
});

const restrictedKey = createStripeRestrictedKey(env.INTEGRATION_STRIPE_RK)._unsafeUnwrap();

const paymentIntentApi = new StripePaymentIntentsApiFactory().create({
  key: restrictedKey,
});

let stripePaymentIntentId: StripePaymentIntentId;

describe("TransactionCancellationRequested webhook: integration", async () => {
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

    await configRepo.saveStripeConfig({
      saleorApiUrl: realSaleorApiUrl,
      appId: mockedSaleorAppId,
      config: StripeConfig.create({
        publishableKey: createStripePublishableKey(env.INTEGRATION_STRIPE_PK)._unsafeUnwrap(),
        name: "Config name",
        webhookId: "we_123",
        restrictedKey,
        webhookSecret: mockStripeWebhookSecret,
        id: randomId,
      })._unsafeUnwrap(),
    });

    await configRepo.updateMapping(
      {
        saleorApiUrl: realSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      {
        configId: randomId,
        channelId: mockedSaleorChannelId,
      },
    );

    const paymentIntentResult = await paymentIntentApi.createPaymentIntent({
      stripeMoney: StripeMoney.createFromSaleorAmount({
        amount: 123.33,
        currency: "USD",
      })._unsafeUnwrap(),
      idempotencyKey: randomId,
      intentParams: {
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_options: {
          card: {
            capture_method: "manual",
          },
        },
      },
    });

    stripePaymentIntentId = createStripePaymentIntentId(paymentIntentResult._unsafeUnwrap().id);

    await transactionRecorderRepo.recordTransaction(
      {
        saleorApiUrl: realSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionIdBranded,
        stripePaymentIntentId,
        saleorTransactionFlow: createSaleorTransactionFlow("AUTHORIZATION"),
        resolvedTransactionFlow: createResolvedTransactionFlow("AUTHORIZATION"),
        selectedPaymentMethod: "card",
      }),
    );
  });

  /**
   * Verify snapshot - if your changes cause manifest to be different, ensure changes are expected
   */
  it("Returns response with CANCEL_SUCCESS", async () => {
    await testApiHandler({
      appHandler: manifestHandlers,
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify(transactionCancelationRequestedFixture(stripePaymentIntentId)),
          headers: new Headers({
            "saleor-api-url": realSaleorApiUrl,
            "saleor-event": "transaction_cancelation_requested",
            "saleor-signature": "mock-signature",
          }),
        });

        const body = await response.json();

        expect(body).toStrictEqual({
          result: "CANCEL_SUCCESS",
          amount: 123.33,
          actions: [],
          pspReference: expect.stringContaining("pi_"),
          message: "Payment intent was cancelled",
          externalUrl: expect.stringContaining("https://dashboard.stripe.com/test/payments/pi_"),
          time: expect.any(String),
        });

        expect(response.status).toStrictEqual(200);
      },
    });
  });
});
