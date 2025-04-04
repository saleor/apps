/* eslint-disable no-console */
import { env } from "@/lib/env";
import { BaseError } from "@/lib/errors";
import { FileAppConfigPresistor } from "@/modules/app-config/file-app-config-presistor";
import { StripeConfig } from "@/modules/app-config/stripe-config";

if (!env.STRIPE_CONFIG_RESTRICTED_KEY) {
  throw new BaseError("Missing required STRIPE_CONFIG_RESTRICTED_KEY environment variable");
}

if (!env.STRIPE_CONFIG_PUBLISHABLE_KEY) {
  throw new BaseError("Missing required STRIPE_CONFIG_PUBLISHABLE_KEY environment variable");
}

if (!env.STRIPE_CONFIG_CHANNEL_ID) {
  throw new BaseError("Missing required STRIPE_CONFIG_CHANNEL_ID environment variable");
}

const presistor = new FileAppConfigPresistor();

const stripeConfigFromEnvResult = StripeConfig.createFromPersistedData({
  configName: "config-from-env-vars",
  configId: "fake-config-id",
  restrictedKeyValue: env.STRIPE_CONFIG_RESTRICTED_KEY,
  publishableKeyValue: env.STRIPE_CONFIG_PUBLISHABLE_KEY,
});

if (stripeConfigFromEnvResult.isErr()) {
  throw new BaseError("Error creating StripeConfig from environment variables", {
    cause: stripeConfigFromEnvResult.error,
  });
}

await presistor.persistStripeConfig({
  config: stripeConfigFromEnvResult.value,
  channelId: env.STRIPE_CONFIG_CHANNEL_ID,
  saleorApiUrl: "https://fake-url.com/graphql/",
  appId: "fake-app-id",
});

console.log("🎉 App config created successfully at .stripe-app-config.json");
