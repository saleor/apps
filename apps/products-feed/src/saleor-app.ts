import { APL, FileAPL, SaleorCloudAPL, UpstashAPL } from "@saleor/app-sdk/APL";
import { RedisAPL } from "@saleor/app-sdk/APL/redis";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { createClient } from "redis";

const aplType = process.env.APL ?? "file";

export let apl: APL;

switch (aplType) {
  case "upstash":
    apl = new UpstashAPL();

    break;
  case "file":
    apl = new FileAPL();

    break;
  case "saleor-cloud": {
    if (!process.env.REST_APL_ENDPOINT || !process.env.REST_APL_TOKEN) {
      throw new Error("Rest APL is not configured - missing env variables. Check saleor-app.ts");
    }

    apl = new SaleorCloudAPL({
      resourceUrl: process.env.REST_APL_ENDPOINT,
      token: process.env.REST_APL_TOKEN,
    });

    break;
  }
  case "redis": {
    if (!process.env.REDIS_URL) {
      throw new Error("Redis APL is not configured - missing env variables. Check saleor-app.ts");
    }

    const client = createClient({
      url: process.env.REDIS_URL,
    });

    apl = new RedisAPL({
      client,
    });

    break;
  }
  default: {
    throw new Error("Invalid APL config, ");
  }
}
export const saleorApp = new SaleorApp({
  apl,
});
