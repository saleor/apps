import { APL, FileAPL, SaleorCloudAPL, UpstashAPL } from "@saleor/app-sdk/APL";
import { RedisAPL } from "@saleor/app-sdk/APL/redis";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";
import { createClient } from "redis";

/**
 * By default auth data are stored in the `.auth-data.json` (FileAPL).
 * For multi-tenant applications and deployments please use UpstashAPL.
 *
 * To read more about storing auth data, read the
 * [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)
 */
const aplType = process.env.APL ?? "file";
let apl: APL;

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

if (!process.env.SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error(
    "For production deployment SECRET_KEY is mandatory to use EncryptedSettingsManager.",
  );
}

// Use placeholder value for the development
export const settingsManagerSecretKey = process.env.SECRET_KEY || "CHANGE_ME";

export const saleorApp = new SaleorApp({
  apl,
});
