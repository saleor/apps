import { DynamodbAppConfigRepo } from "@/modules/app-config/repositories/dynamodb/dynamodb-app-config-repo";

/*
 * Replace this implementation with custom DB (Redis, Metadata etc) to drop DynamoDB and bring something else
 */
export const appConfigRepoImpl = new DynamodbAppConfigRepo();
