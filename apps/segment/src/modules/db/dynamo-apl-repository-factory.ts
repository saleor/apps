import { BaseError } from "@/errors";

import { DynamoAPLRepository } from "./dynamo-apl-repository";

export class DynamoAPLRepositoryFactory {
  static RepositoryCreationError = BaseError.subclass("RepositoryCreationError");

  static create(): DynamoAPLRepository {
    try {
      return new DynamoAPLRepository();
    } catch (error) {
      throw new DynamoAPLRepositoryFactory.RepositoryCreationError(
        "Failed to create DynamoDB APL repository",
        { cause: error },
      );
    }
  }
}
