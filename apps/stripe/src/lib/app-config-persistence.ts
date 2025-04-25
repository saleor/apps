import { dynamoDbChannelConfigMappingEntity } from "@/modules/app-config/repositories/dynamodb/channel-config-mapping-db-model";
import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";
import { dynamoDbStripeConfigEntity } from "@/modules/app-config/repositories/dynamodb/stripe-config-db-model";
/*
 * Replace this implementation with custom DB (Redis, Metadata etc) to drop DynamoDB and bring something else
 *
 * todo docs that this can be replaced using fork
 */
export const appConfigPersistence = new DynamodbAppConfigRepo({
  entities: {
    channelConfigMapping: dynamoDbChannelConfigMappingEntity,
    stripeConfig: dynamoDbStripeConfigEntity,
  },
});
