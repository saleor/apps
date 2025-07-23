import { DynamoDBAppTransactionRepo } from "./dynamodb-app-transaction-repo";

/*
 * Replace this implementation with custom DB (Redis, Metadata etc) to drop DynamoDB and bring something else
 */
export const appTransactionRepo = new DynamoDBAppTransactionRepo();
