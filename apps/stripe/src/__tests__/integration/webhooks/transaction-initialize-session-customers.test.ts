import { DynamoAPL } from "@saleor/app-sdk/APL/dynamodb";
import { Encryptor } from "@saleor/apps-shared/encryptor";
import { testApiHandler } from "next-test-api-route-handler";
import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { transactionInitializeSessionFixture } from "@/__tests__/integration/webhooks/fixtures/transaction-initialize-session-fixture";
import { mockedSaleorAppId, mockedSaleorChannelId } from "@/__tests__/mocks/constants";
import { mockStripeWebhookSecret } from "@/__tests__/mocks/stripe-webhook-secret";
import * as initializeSessionHandlers from "@/app/api/webhooks/saleor/transaction-initialize-session/route";
import * as verifyWebhookSignatureModule from "@/app/api/webhooks/saleor/verify-signature";
import { type TransactionInitializeSessionEventFragment } from "@/generated/graphql";
import { RandomId } from "@/lib/random-id";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbChannelConfigMapping } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripeClient } from "@/modules/stripe/stripe-client";
import { StripeCustomersApi } from "@/modules/stripe/stripe-customers-api";
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

import { env } from "../env";

const realSaleorApiUrl = createSaleorApiUrl(env.INTEGRATION_SALEOR_API_URL)._unsafeUnwrap();
const restrictedKey = createStripeRestrictedKey(env.INTEGRATION_STRIPE_RK)._unsafeUnwrap();
const stripe = StripeClient.createFromRestrictedKey(restrictedKey).nativeClient;

const repo = new DynamodbAppConfigRepo({
  entities: {
    channelConfigMapping: DynamoDbChannelConfigMapping.entity,
    stripeConfig: DynamoDbStripeConfig.entity,
  },
  encryptor: new Encryptor(env.SECRET_KEY),
});

const apl = DynamoAPL.create({ table: dynamoMainTable });

const buyerAddress = {
  firstName: "Integration",
  lastName: "Buyer",
  companyName: "",
  streetAddress1: "1 Test Street",
  streetAddress2: "",
  city: "Test City",
  postalCode: "00-001",
  country: { code: "PL" },
  countryArea: "",
  phone: "+48123456789",
};

const withBuyer = (
  user: { id: string; email: string; firstName: string; lastName: string } | null,
): TransactionInitializeSessionEventFragment => {
  const fixture = transactionInitializeSessionFixture();

  return {
    ...fixture,
    sourceObject: {
      __typename: "Checkout",
      id: "checkout-id",
      channel: { slug: "default-channel", id: mockedSaleorChannelId },
      email: "integration-buyer@example.com",
      user,
      billingAddress: buyerAddress,
      shippingAddress: buyerAddress,
    },
  };
};

const initializeSession = async (event: TransactionInitializeSessionEventFragment) => {
  let paymentIntentId = "";

  await testApiHandler({
    appHandler: initializeSessionHandlers,
    async test({ fetch }) {
      const response = await fetch({
        method: "POST",
        body: JSON.stringify(event),
        headers: new Headers({
          "saleor-api-url": realSaleorApiUrl,
          "saleor-event": "transaction_initialize_session",
          "saleor-signature": "mock-signature",
        }),
      });

      expect(response.status).toBe(200);

      paymentIntentId = (await response.json()).pspReference;
    },
  });

  return stripe.paymentIntents.retrieve(paymentIntentId);
};

const createdCustomerIds = new Set<string>();

const trackCustomer = (paymentIntent: Stripe.PaymentIntent) => {
  const customerId = paymentIntent.customer as string | null;

  if (customerId) {
    createdCustomerIds.add(customerId);
  }

  return customerId;
};

const setupConfig = async ({ customerCreationEnabled }: { customerCreationEnabled: boolean }) => {
  const configId = new RandomId().generate();

  await repo.saveStripeConfig({
    saleorApiUrl: realSaleorApiUrl,
    appId: mockedSaleorAppId,
    config: StripeConfig.create({
      publishableKey: createStripePublishableKey(env.INTEGRATION_STRIPE_PK)._unsafeUnwrap(),
      name: "Config name",
      webhookId: "we_123",
      restrictedKey,
      webhookSecret: mockStripeWebhookSecret,
      id: configId,
      customerCreationEnabled,
    })._unsafeUnwrap(),
  });

  await repo.updateMapping(
    { saleorApiUrl: realSaleorApiUrl, appId: mockedSaleorAppId },
    { configId, channelId: mockedSaleorChannelId },
  );
};

describe("TransactionInitializeSession webhook - Stripe Customers: integration", () => {
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
  });

  afterEach(async () => {
    await Promise.allSettled([...createdCustomerIds].map((id) => stripe.customers.del(id)));
    createdCustomerIds.clear();
  });

  it("Reuses one Customer across payments of the same signed-in user", async () => {
    await setupConfig({ customerCreationEnabled: true });

    const user = {
      id: `integration-user-${new RandomId().generate()}`,
      email: "integration-buyer@example.com",
      firstName: "Integration",
      lastName: "Buyer",
    };

    const firstPayment = await initializeSession(withBuyer(user));
    const secondPayment = await initializeSession(withBuyer(user));

    const customerId = trackCustomer(firstPayment);

    trackCustomer(secondPayment);

    expect(customerId).toMatch(/^cus_/);
    expect(secondPayment.customer).toBe(customerId);
    expect(firstPayment.shipping?.name).toBe("Integration Buyer");

    const customer = (await stripe.customers.retrieve(customerId!)) as Stripe.Customer;

    expect(customer.name).toBe("Integration Buyer");
    expect(customer.email).toBe("integration-buyer@example.com");
    expect(customer.address?.country).toBe("PL");
    expect(customer.metadata).toStrictEqual({
      saleor_api_url: realSaleorApiUrl,
      saleor_user_id: user.id,
    });
  });

  it("Creates the Payment Intent without a Customer or shipping for a guest", async () => {
    await setupConfig({ customerCreationEnabled: true });

    const payment = await initializeSession(withBuyer(null));

    expect(trackCustomer(payment)).toBeNull();
    expect(payment.shipping).toBeNull();
  });

  it("Creates the Payment Intent without a Customer when customer creation is off", async () => {
    await setupConfig({ customerCreationEnabled: false });

    const payment = await initializeSession(withBuyer(null));

    expect(trackCustomer(payment)).toBeNull();
    expect(payment.shipping).toBeNull();
  });
});

describe("StripeCustomersApi.hasCustomersWritePermission: integration", () => {
  it("Returns true for a key with Customers - Write", async () => {
    const api = StripeCustomersApi.createFromKey({ key: restrictedKey });

    expect((await api.hasCustomersWritePermission())._unsafeUnwrap()).toBe(true);
  });
});
