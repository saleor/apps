import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { Encryptor } from "@saleor/apps-shared/encryptor";
import { testApiHandler } from "next-test-api-route-handler";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockedSaleorAppId,
  mockedSaleorChannelId,
  mockedSaleorSchemaVersionSupportingPaymentMethodDetails,
  mockedSaleorTransactionId,
} from "@/__tests__/mocks/constants";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import * as stripeWebhookHandlers from "@/app/api/webhooks/stripe/route";
import { WebhookParams } from "@/app/api/webhooks/stripe/webhook-params";
import { RandomId } from "@/lib/random-id";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { createResolvedTransactionFlow } from "@/modules/resolved-transaction-flow";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { createSaleorTransactionFlow } from "@/modules/saleor/saleor-transaction-flow";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { StripeMoney } from "@/modules/stripe/stripe-money";
import {
  createStripePaymentIntentId,
  StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRefundId } from "@/modules/stripe/stripe-refund-id";
import { StripeRefundsApiFactory } from "@/modules/stripe/stripe-refunds-api-factory";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { StripeWebhookUrlBuilder } from "@/modules/stripe/stripe-webhook-url-builder";
import { RecordedTransaction } from "@/modules/transactions-recording/domain/recorded-transaction";
import { DynamoDBTransactionRecorderRepo } from "@/modules/transactions-recording/repositories/dynamodb/dynamodb-transaction-recorder-repo";
import { DynamoDbRecordedTransaction } from "@/modules/transactions-recording/repositories/dynamodb/recorded-transaction-db-model";

import { env } from "../env";
import { mswServer } from "../msw-server";
import { chargeRefundUpdatedEventFixture } from "./fixtures/charge-refund-updated-event-fixture";
import { paymentIntentSucceededEventFixture } from "./fixtures/payment-intent-succeeded-event-fixture";

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

const refundApi = new StripeRefundsApiFactory().create({
  key: restrictedKey,
});

const stripeMoney = StripeMoney.createFromSaleorAmount({
  amount: 123.33,
  currency: "USD",
})._unsafeUnwrap();

let stripePaymentIntentId: StripePaymentIntentId;

const saleorRequestVarsSpy = vi.fn();

const urlBuilder = new StripeWebhookUrlBuilder();

describe("Stripe Webhook: integration", () => {
  beforeAll(() =>
    mswServer.listen({
      onUnhandledRequest: (request, print) => {
        if (request.url.includes(env.AWS_ENDPOINT_URL)) {
          return; // Do not print warnings for DynamoDB local
        }
        if (request.url.includes("stripe.com")) {
          return; // Do not print warnings for Stripe API - we use real Stripe API in these tests
        }
        print.warning();
      },
    }),
  );
  afterAll(() => mswServer.close());
  afterEach(() => mswServer.resetHandlers());

  beforeEach(async () => {
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

    stripePaymentIntentId = createStripePaymentIntentId(paymentIntentResult._unsafeUnwrap().id);

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

    mswServer.events.on("response:mocked", async ({ request }) => {
      const clonedRequest = request.clone();
      const requestJSON = await clonedRequest.json();

      saleorRequestVarsSpy(requestJSON);
    });
  });

  it("should successfully process a payment intent event", async () => {
    const payload = paymentIntentSucceededEventFixture(stripePaymentIntentId);

    const payloadString = JSON.stringify(payload, null, 2);

    const stripeClient = StripeClient.createFromRestrictedKey(restrictedKey);

    const header = stripeClient.nativeClient.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: mockStripeWebhookSecret,
    });

    const webhookUrl = urlBuilder.buildUrl({
      appUrl: "https://stripe-v2.saleor.app/api/webhooks/stripe",
      webhookParams: WebhookParams.createFromParams({
        configurationId: configId,
        saleorApiUrl: realSaleorApiUrl,
        appId: mockedSaleorAppId,
      }),
    });

    await testApiHandler({
      appHandler: stripeWebhookHandlers,
      url: webhookUrl._unsafeUnwrap().toString(),
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: payloadString,
          headers: new Headers({
            "stripe-signature": header,
          }),
        });

        const body = await response.text();

        expect(body).toStrictEqual("Ok");

        const requestSpyData = saleorRequestVarsSpy.mock.calls[0][0];

        expect(requestSpyData.variables).toStrictEqual({
          amount: 1.013,
          availableActions: ["REFUND"],
          externalUrl: expect.stringContaining(stripePaymentIntentId),
          message: "Payment intent has been successful",
          pspReference: stripePaymentIntentId,
          time: expect.any(String),
          transactionId: mockedSaleorTransactionId,
          type: "CHARGE_SUCCESS",
          paymentMethodDetails: {
            card: {
              brand: "visa",
              name: "visa",
              expMonth: expect.any(Number),
              expYear: expect.any(Number),
              lastDigits: "4242",
            },
          },
        });
      },
    });
  });

  it("should successfully process a charge refund updated event", async () => {
    const stripeRefund = await refundApi.createRefund({
      paymentIntentId: stripePaymentIntentId,
      stripeMoney,
    });

    const stripeRefundId = createStripeRefundId(stripeRefund._unsafeUnwrap().id);

    const payload = chargeRefundUpdatedEventFixture(stripeRefundId, stripePaymentIntentId);

    const payloadString = JSON.stringify(payload, null, 2);

    const stripeClient = StripeClient.createFromRestrictedKey(restrictedKey);

    const header = stripeClient.nativeClient.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret: mockStripeWebhookSecret,
    });

    const webhookUrl = urlBuilder.buildUrl({
      appUrl: "https://stripe-v2.saleor.app/api/webhooks/stripe",
      webhookParams: WebhookParams.createFromParams({
        configurationId: configId,
        saleorApiUrl: realSaleorApiUrl,
        appId: mockedSaleorAppId,
      }),
    });

    await testApiHandler({
      appHandler: stripeWebhookHandlers,
      url: webhookUrl._unsafeUnwrap().toString(),
      async test({ fetch }) {
        const response = await fetch({
          method: "POST",
          body: payloadString,
          headers: new Headers({
            "stripe-signature": header,
          }),
        });

        const body = await response.text();

        expect(body).toStrictEqual("Ok");

        const requestSpyData = saleorRequestVarsSpy.mock.calls[0][0];

        expect(requestSpyData.variables).toStrictEqual({
          amount: 10,
          availableActions: ["REFUND"],
          externalUrl: expect.stringContaining(stripeRefundId),
          message: "Refund was successful",
          pspReference: stripeRefundId,
          time: expect.any(String),
          transactionId: mockedSaleorTransactionId,
          type: "REFUND_SUCCESS",
          paymentMethodDetails: null,
        });
      },
    });
  });
});
