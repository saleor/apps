import { DynamoDBTransactionRecordRepo } from "./dynamodb-transaction-record-repo";

/*
 * Replace this implementation with custom DB (Redis, Metadata etc) to drop DynamoDB and bring something else
 */
export const transactionRecordRepo = new DynamoDBTransactionRecordRepo();
