import { BaseError } from "@/errors";

import { DynamoConfigRepository } from "./dynamo-config-repository";
import { segmentMainTable, SegmentMainTableEntityFactory } from "./segment-main-table";

export class DynamoConfigRepositoryFactory {
  static RepositoryCreationError = BaseError.subclass("RepositoryCreationError");

  static create(): DynamoConfigRepository {
    try {
      const segmentConfigEntity =
        SegmentMainTableEntityFactory.createConfigEntity(segmentMainTable);

      return new DynamoConfigRepository({ segmentConfigEntity });
    } catch (error) {
      throw new DynamoConfigRepositoryFactory.RepositoryCreationError(
        "Failed to create DynamoDB config repository",
        { cause: error },
      );
    }
  }
}
