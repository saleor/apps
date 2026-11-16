import { zodToJsonSchema } from "zod-to-json-schema";

import { TransactionInitializeEventDataSchema } from "@/app/api/webhooks/saleor/transaction-initialize-session/event-data-parser";

/*
 * JSON Schemas for the `data` a storefront sends to the app, generated from the parsers that
 * validate it. They are served from public/.well-known, so storefronts and coding agents can
 * validate their payloads. `pnpm generate` regenerates them.
 *
 * `removeAdditionalStrategy: "strict"` makes `additionalProperties` follow each zod object's own
 * unknown-key mode: `.strict()` objects reject unknown keys, so the schema does too, while
 * default (strip) objects allow them.
 */
export const requestDataJsonSchemas = {
  "TransactionInitializeSessionRequestData.schema.json": zodToJsonSchema(
    TransactionInitializeEventDataSchema,
    { $refStrategy: "none", removeAdditionalStrategy: "strict" },
  ),
};
