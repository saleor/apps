import { DynamodbDbVariantsStorage } from "./dynamodb/dynamodb-db-variants-storage";

// Replace to use other storage/db
export const dbVariantsStorage = new DynamodbDbVariantsStorage();
