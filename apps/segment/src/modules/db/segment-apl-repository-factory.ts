import { env } from "@/env";
import { BaseError } from "@/errors";

import { SegmentAPLRepository } from "./segment-apl-repository";
import {
  documentClient,
  SegmentMainTable,
  SegmentMainTableEntityFactory,
} from "./segment-main-table";

export class SegmentAPLRepositoryFactory {
  static RepositoryCreationError = BaseError.subclass("RepositoryCreationError");

  static create(): SegmentAPLRepository {
    if (
      !env.DYNAMODB_MAIN_TABLE_NAME ||
      !env.AWS_REGION ||
      !env.AWS_ACCESS_KEY_ID ||
      !env.AWS_SECRET_ACCESS_KEY
    ) {
      throw new SegmentAPLRepositoryFactory.RepositoryCreationError(
        "DynamoDB APL is not configured - missing env variables.",
      );
    }

    try {
      // TODO: when we have config in DyanamoDB - move to `segment-main-table.ts`
      const table = SegmentMainTable.create({
        tableName: env.DYNAMODB_MAIN_TABLE_NAME,
        documentClient,
      });
      const segmentAPLEntity = SegmentMainTableEntityFactory.createAPLEntity(table);

      return new SegmentAPLRepository({ segmentAPLEntity });
    } catch (error) {
      throw new SegmentAPLRepositoryFactory.RepositoryCreationError(
        "Failed to create DynamoDB APL repository",
        { cause: error },
      );
    }
  }
}
