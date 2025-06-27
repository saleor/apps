import {
  BatchDeleteRequest,
  BatchWriteCommand,
  PutItemCommand,
  QueryCommand,
} from "dynamodb-toolbox";
import { execute } from "dynamodb-toolbox/table/actions/batchWrite";

import { createLogger } from "../../../logger";
import { AccessPattern, DbVariantsStorage } from "../db-variants-storage";
import { DynamoDbDirtyVariant } from "./db-variant-storage-dynamodb-model";

export class DynamodbDbVariantsStorage implements DbVariantsStorage {
  private logger = createLogger("DynamodbDbVariantsStorage");

  async getDirtyVariants(access: AccessPattern, limit: number): Promise<string[]> {
    const command = DynamoDbDirtyVariant.entity.table
      .build(QueryCommand)
      .entities(DynamoDbDirtyVariant.entity)
      .query({
        partition: DynamoDbDirtyVariant.accessPattern.getPK(access),
        limit: limit,
      });

    const result = await command.send();

    if (result.$metadata?.httpStatusCode !== 200) {
      this.logger.error("Failed to get items from DynamoDB", { result });
      throw new Error("Failed to get items from DynamoDB");
    }

    return (result.Items ?? []).map((item) =>
      DynamoDbDirtyVariant.accessPattern.extractIdFromSk(item.SK),
    );
  }

  async setDirtyVariant(access: AccessPattern, variantId: string): Promise<void> {
    const result = await DynamoDbDirtyVariant.entity
      .build(PutItemCommand)
      .item({
        PK: DynamoDbDirtyVariant.accessPattern.getPK(access),
        SK: DynamoDbDirtyVariant.accessPattern.getSKforSpecificItem({
          variantId,
        }),
      })
      .send();

    if (result.$metadata.httpStatusCode !== 200) {
      this.logger.error("Failed to set item in DynamoDB", { result });
      throw new Error("Failed to set item in DynamoDB");
    }
  }

  async clearDirtyVariants(access: AccessPattern, variantIds: string[]): Promise<void> {
    const actions = variantIds.map((id) =>
      DynamoDbDirtyVariant.entity.build(BatchDeleteRequest).key({
        PK: DynamoDbDirtyVariant.accessPattern.getPK(access),
        SK: DynamoDbDirtyVariant.accessPattern.getSKforSpecificItem({ variantId: id }),
      }),
    );

    const batchDelete = DynamoDbDirtyVariant.entity.table
      .build(BatchWriteCommand)
      .requests(...actions);

    const result = await execute(batchDelete);

    if (result.$metadata.httpStatusCode !== 200) {
      this.logger.error("Failed to delete items in DynamoDB", { result });
      throw new Error("Failed to delete items in DynamoDB");
    }
  }
}
