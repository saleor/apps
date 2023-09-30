import { APL, FileAPL, RedisAPL, SaleorCloudAPL, UpstashAPL } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

const aplType = process.env.APL ?? "file";

export let apl: APL;

switch (aplType) {
  case "redis": {
    if (!process.env.REDIS_URL) throw new Error("Missing redis url");
    if (!process.env.APP_API_BASE_URL)
      throw new Error("Redis relies on APP_API_BASE_URL to store keys, please set env variable");
    apl = new RedisAPL(new URL(process.env.REDIS_URL), process.env.APP_API_BASE_URL);
  }
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
  default: {
    throw new Error("Invalid APL config, ");
  }
}
export const saleorApp = new SaleorApp({
  apl,
});

export const REQUIRED_SALEOR_VERSION = ">=3.11.7 <4";
