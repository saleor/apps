import { Entity, schema, string } from "dynamodb-toolbox";

import { DynamoMainTable, dynamoMainTable } from "../../dynamodb/dynamo-main-table";

class AccessPattern {
  static getPK({ saleorApiUrl, appId }: { saleorApiUrl: string; appId: string }) {
    return DynamoMainTable.getPrimaryKeyScopedToInstallation({ saleorApiUrl, appId });
  }

  static getSKforSpecificItem({ variantId }: { variantId: string }) {
    return `VARIANT_DIRTY#${variantId}` as const;
  }

  static getSKforAllItems() {
    return `VARIANT_DIRTY#` as const;
  }

  static extractIdFromSk(SK: string) {
    return SK.replace("VARIANT_DIRTY#", "");
  }
}

const DirtyVariantSchema = schema({
  PK: string().key(),
  // SK includes variant ID so no other fields are needed
  SK: string().key(),
});

const createEntity = (table: DynamoMainTable) => {
  return new Entity({
    table,
    name: "DirtyVariant",
    schema: DirtyVariantSchema,
    timestamps: {
      created: {
        name: "createdAt",
        savedAs: "createdAt",
      },
      modified: {
        name: "modifiedAt",
        savedAs: "modifiedAt",
      },
    },
  });
};

const entity = createEntity(dynamoMainTable);

export type DirtyVariantDynamoDbEntity = typeof entity;

export const DynamoDbDirtyVariant = {
  accessPattern: {
    getPK: AccessPattern.getPK,
    getSKforSpecificItem: AccessPattern.getSKforSpecificItem,
    getSKforAllItems: AccessPattern.getSKforAllItems,
    extractIdFromSk: AccessPattern.extractIdFromSk,
  },
  entitySchema: DirtyVariantSchema,
  createEntity: createEntity,
  entity: entity,
};
