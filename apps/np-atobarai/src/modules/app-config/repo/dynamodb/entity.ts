import { boolean, Entity, item, string } from "dynamodb-toolbox";

import { dynamoMainTable } from "@/modules/dynamodb/dynamodb-main-table";

export const appConfigSchema = item({
  PK: string().key(),
  SK: string().key(),
  configId: string(),
  configName: string(),
  shippingCompanyCode: string(),
  useSandbox: boolean(),
  fillMissingAddress: boolean(),
  skuAsName: boolean(),
  merchantCode: string(),
  spCode: string(),
  terminalId: string(),
});

export const appConfigEntity = new Entity({
  name: "APP_CONFIG",
  schema: appConfigSchema,
  table: dynamoMainTable,
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
