import { APL } from "@saleor/app-sdk/APL";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { DynamoAPL } from "@/modules/apl/dynamodb-apl";

import { env } from "./env";

export let apl: APL;
switch (env.APL) {
  case "dynamodb": {
    const repository = DynamoAPLRepositoryFactory.create();

    apl = new DynamoAPL({ repository });
    break;
  }

  default: {
    apl = new FileAPL();
    break;
  }
}

export const saleorApp = new SaleorApp({
  apl,
});
