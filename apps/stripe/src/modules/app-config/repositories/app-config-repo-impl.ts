import { Encryptor } from "@saleor/apps-shared/encryptor";
import { createDynamoConfigRepository, GenericRepo } from "@saleor/dynamo-config-repository";

import { env } from "@/lib/env";
import { BaseError } from "@/lib/errors";
import { StripeConfig } from "@/modules/app-config/domain/stripe-config";
import { DynamoDbStripeConfig } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
import { dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { createStripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

const encryptor = new Encryptor(env.SECRET_KEY);

/*
 * Replace this implementation with custom DB (Redis, Metadata etc) to drop DynamoDB and bring something else
 */
export const appConfigRepoImpl = createDynamoConfigRepository<
  StripeConfig,
  typeof DynamoDbStripeConfig.entity,
  typeof DynamoDbStripeConfig.entitySchema
>({
  configItem: {
    toolboxEntity: DynamoDbStripeConfig.entity,
    entitySchema: DynamoDbStripeConfig.entitySchema,
    idAttr: "configId",
  },
  table: dynamoMainTable,
  mapping: {
    singleDynamoItemToDomainEntity(item) {
      const configResult = StripeConfig.create({
        name: item.configName,
        restrictedKey: createStripeRestrictedKey(encryptor.decrypt(item.stripeRk))._unsafeUnwrap(), // make it throwable
        webhookId: item.stripeWhId,
        id: item.configId,
        publishableKey: createStripePublishableKey(item.stripePk)._unsafeUnwrap(), // make it throwable
        webhookSecret: createStripeWebhookSecret(
          encryptor.decrypt(item.stripeWhSecret),
        )._unsafeUnwrap(), // make it throwable
      });

      if (configResult.isErr()) {
        // Throw and catch it below, so neverthrow can continue, to avoid too much boilerplate
        throw new BaseError("Failed to parse config from DynamoDB", {
          cause: configResult.error,
        });
      }

      return configResult.value;
    },
    singleDomainEntityToDynamoItem(config) {
      return {
        configId: config.id,
        stripePk: config.publishableKey,
        stripeRk: encryptor.encrypt(config.restrictedKey),
        stripeWhId: config.webhookId,
        stripeWhSecret: encryptor.encrypt(config.webhookSecret),
        configName: config.name,
      };
    },
  },
});

export type AppConfigRepo = GenericRepo<StripeConfig>;
