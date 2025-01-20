import { BaseError } from "@/errors";

import { DynamoConfigRepository } from "./dynamo-config-repository";

export class DynamoConfigRepositoryFactory {
  static RepositoryCreationError = BaseError.subclass("RepositoryCreationError");

  static create(): DynamoConfigRepository {
    try {
      return new DynamoConfigRepository();
    } catch (error) {
      throw new DynamoConfigRepositoryFactory.RepositoryCreationError(
        "Failed to create DynamoDB config repository",
        { cause: error },
      );
    }
  }
}
