import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { Encryptor } from "@saleor/apps-shared/encryptor";
import { testApiHandler } from "next-test-api-route-handler";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockedSaleorAppId,
  mockedSaleorChannelId,
  mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
  mockedSaleorTransactionId,
} from "@/__tests__/mocks/constants";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import * as transactionRefundRequested from "@/app/api/webhooks/saleor/transaction-refund-requested/route";
import * as verifyWebhookSignatureModule from "@/app/api/webhooks/saleor/verify-signature";
import { RandomId } from "@/lib/random-id";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import { createStripePaymentIntentId } from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { DynamoDBTransactionRecorderRepo } from "@/modules/transactions-recording/repositories/dynamodb/dynamodb-transaction-recorder-repo";
import { DynamoDbRecordedTransaction } from "@/modules/transactions-recording/repositories/dynamodb/recorded-transaction-db-model";

import { env } from "../env";
import { transactionRefundRequestedFixture } from "./fixtures/transaction-refund-requested-fixture";

const realSaleorApiUrl = createSaleorApiUrl(env.INTEGRATION_SALEOR_API_URL)._unsafeUnwrap();

const configId = new RandomId().generate();

const configRepo = new DynamodbAppConfigRepo({
  entities: {
    channelConfigMapping: DynamoDbChannelConfigMapping.entity,
    stripeConfig: DynamoDbStripeConfig.entity,
  },
  encryptor: new Encryptor(env.SECRET_KEY),
});

const transactionRecorderRepo = new DynamoDBTransactionRecorderRepo({
  entity: DynamoDbRecordedTransaction.entity,
});

const apl = DynamoAPL.create({
  table: dynamoMainTable,
});

const restrictedKey = createStripeRestrictedKey(env.INTEGRATION_STRIPE_RK)._unsafeUnwrap();

const paymentIntentApi = new StripePaymentIntentsApiFactory().create({
  key: restrictedKey,
});

const stripeMoney = StripeMoney.createFromSaleorAmount({
  amount: 123.33,
  currency: "USD",
})._unsafeUnwrap();

describe("TransactionRefundRequested webhook: integration", async () => {
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
        id: configId,
      })._unsafeUnwrap(),
    });

    await configRepo.updateMapping(
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

  it("Returns response with pspReference of the Stripe refund (Saleor async flow)", async () => {
    const paymentIntentResult = await paymentIntentApi.createPaymentIntent({
      stripeMoney,
      idempotencyKey: new RandomId().generate(),
      intentParams: {
        return_url: "https://saleor-stripe-integration-test.com",
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method: "pm_card_visa",
        confirm: true,
      },
    });

    const stripePaymentIntentId = createStripePaymentIntentId(
      paymentIntentResult._unsafeUnwrap().id,
    );

    await transactionRecorderRepo.recordTransaction(
      {
        saleorApiUrl: realSaleorApiUrl,
        appId: mockedSaleorAppId,
      },
      new RecordedTransaction({
        saleorTransactionId: mockedSaleorTransactionId,
        stripePaymentIntentId,
        saleorTransactionFlow: createSaleorTransactionFlow("CHARGE"),
        resolvedTransactionFlow: createResolvedTransactionFlow("CHARGE"),
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
      }),
    );

    await testApiHandler({
      appHandler: transactionRefundRequested,
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify(transactionRefundRequestedFixture(stripePaymentIntentId)),
          headers: new Headers({
            "saleor-api-url": realSaleorApiUrl,
            "saleor-event": "transaction_refund_requested",
            "saleor-signature": "mock-signature",
          }),
        });

        const body = await response.json();

        expect(body).toStrictEqual({
          pspReference: expect.stringContaining("re_"),
        });

        expect(response.status).toStrictEqual(200);
      },
    });
  });
});
