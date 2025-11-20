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
import * as transactionProcessSession from "@/app/api/webhooks/saleor/transaction-process-session/route";
import * as verifyWebhookSignatureModule from "@/app/api/webhooks/saleor/verify-signature";
import { RandomId } from "@/lib/random-id";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
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
import { transactionProcessSessionFixture } from "./fixtures/transaction-process-session-fixture";

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

describe("TransactionProcessSession webhook: integration", async () => {
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

  it("Returns response with CHARGE_SUCCESS when payment intent is sucessfully paid for and Saleor transactionFlow is: CHARGE", async () => {
    const saleorTransactionFlow = createSaleorTransactionFlow("CHARGE");
    const resolvedTransactionFlow = createResolvedTransactionFlow("CHARGE");

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
        saleorTransactionFlow,
        resolvedTransactionFlow,
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
      }),
    );

    await testApiHandler({
      appHandler: transactionProcessSession,
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify(
            transactionProcessSessionFixture(stripePaymentIntentId, saleorTransactionFlow),
          ),
          headers: new Headers({
            "saleor-api-url": realSaleorApiUrl,
            "saleor-event": "transaction_process_session",
            "saleor-signature": "mock-signature",
          }),
        });

        const body = await response.json();

        expect(body).toStrictEqual({
          result: "CHARGE_SUCCESS",
          amount: 123.33,
          actions: ["REFUND"],
          pspReference: expect.stringContaining("pi_"),
          message: "Payment intent has been successful",
          externalUrl: expect.stringContaining("https://dashboard.stripe.com/test/payments/pi_"),
          paymentMethodDetails: {
            brand: "visa",
            name: "visa",
            expMonth: expect.any(Number),
            expYear: expect.any(Number),
            lastDigits: "4242",
            type: "CARD",
          },
        });

        expect(response.status).toStrictEqual(200);
      },
    });
  });

  it("Returns response with AUTHORIZATION_SUCCESS when payment intent is sucessfully paid for and Saleor transactionFlow is: AUTHORIZATION", async () => {
    const saleorTransactionFlow = createSaleorTransactionFlow("AUTHORIZATION");
    const resolvedTransactionFlow = createResolvedTransactionFlow("AUTHORIZATION");

    const paymentIntentResult = await paymentIntentApi.createPaymentIntent({
      stripeMoney,
      idempotencyKey: new RandomId().generate(),
      intentParams: {
        return_url: "https://saleor-stripe-integration-test.com",
        automatic_payment_methods: {
          enabled: true,
        },
        payment_method_options: {
          card: {
            capture_method: "manual",
          },
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
        saleorTransactionFlow,
        resolvedTransactionFlow,
        selectedPaymentMethod: "card",
        saleorSchemaVersion: mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
      }),
    );

    await testApiHandler({
      appHandler: transactionProcessSession,
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: JSON.stringify(
            transactionProcessSessionFixture(stripePaymentIntentId, saleorTransactionFlow),
          ),
          headers: new Headers({
            "saleor-api-url": realSaleorApiUrl,
            "saleor-event": "transaction_process_session",
            "saleor-signature": "mock-signature",
          }),
        });

        const body = await response.json();

        expect(body).toStrictEqual({
          result: "AUTHORIZATION_SUCCESS",
          amount: 123.33,
          actions: ["CHARGE", "CANCEL"],
          pspReference: expect.stringContaining("pi_"),
          message: "Payment intent has been successful",
          externalUrl: expect.stringContaining("https://dashboard.stripe.com/test/payments/pi_"),
          paymentMethodDetails: {
            brand: "visa",
            expMonth: expect.any(Number),
            expYear: expect.any(Number),
            lastDigits: "4242",
            name: "visa",
            type: "CARD",
          },
        });

        expect(response.status).toStrictEqual(200);
      },
    });
  });
});
