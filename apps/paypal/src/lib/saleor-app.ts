import { APL } from "@saleor/app-sdk/APL";
import { FileAPL } from "@saleor/app-sdk/APL/file";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

import { env } from "./env";
import { PostgresAPL } from "./postgres-apl";

export let apl: APL;
switch (env.APL) {
  case "postgres": {
    apl = new PostgresAPL("PayPal");
    break;
  }
  case "saleor-cloud": {
    // For Saleor Cloud, we might need a different APL
    apl = new FileAPL();
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
