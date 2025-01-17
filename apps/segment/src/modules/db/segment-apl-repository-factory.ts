import { BaseError } from "@/errors";

import { SegmentConfigRepository } from "./segment-apl-repository";
import { segmentMainTable, SegmentMainTableEntityFactory } from "./segment-main-table";

export class SegmentAPLRepositoryFactory {
  static RepositoryCreationError = BaseError.subclass("RepositoryCreationError");

  static create(): SegmentConfigRepository {
    try {
      const segmentAPLEntity = SegmentMainTableEntityFactory.createAPLEntity(segmentMainTable);

      return new SegmentConfigRepository({ segmentAPLEntity });
    } catch (error) {
      throw new SegmentAPLRepositoryFactory.RepositoryCreationError(
        "Failed to create DynamoDB APL repository",
        { cause: error },
      );
    }
  }
}
