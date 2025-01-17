import { BaseError } from "@/errors";

import { SegmentConfigRepository } from "./segment-config-repository";
import { segmentMainTable, SegmentMainTableEntityFactory } from "./segment-main-table";

export class SegmentConfigRepositoryFactory {
  static RepositoryCreationError = BaseError.subclass("RepositoryCreationError");

  static create(): SegmentConfigRepository {
    try {
      const segmentConfigEntity =
        SegmentMainTableEntityFactory.createConfigEntity(segmentMainTable);

      return new SegmentConfigRepository({ segmentConfigEntity });
    } catch (error) {
      throw new SegmentConfigRepositoryFactory.RepositoryCreationError(
        "Failed to create DynamoDB config repository",
        { cause: error },
      );
    }
  }
}
