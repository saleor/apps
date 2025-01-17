import { BaseError } from "@/errors";

import { SegmentAPLRepository } from "./segment-apl-repository";
import { segmentMainTable, SegmentMainTableEntityFactory } from "./segment-main-table";

export class SegmentAPLRepositoryFactory {
  static RepositoryCreationError = BaseError.subclass("RepositoryCreationError");

  static create(): SegmentAPLRepository {
    try {
      const segmentAPLEntity = SegmentMainTableEntityFactory.createAPLEntity(segmentMainTable);

      return new SegmentAPLRepository({ segmentAPLEntity });
    } catch (error) {
      throw new SegmentAPLRepositoryFactory.RepositoryCreationError(
        "Failed to create DynamoDB APL repository",
        { cause: error },
      );
    }
  }
}
