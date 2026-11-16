/* eslint-disable no-console */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { compile, type JSONSchema } from "json-schema-to-typescript";

// Root `pnpm fetch-schema` downloads these, pinned to the root Saleor schema version.
const jsonSchemasDir = path.resolve(import.meta.dirname, "../../../saleor-json-schemas");

const schemaFileNames = [
  "PaymentGatewayInitializeSession",
  "TransactionCancelationRequested",
  "TransactionChargeRequested",
  "TransactionInitializeSession",
  "TransactionProcessSession",
  "TransactionRefundRequested",
];

const convertToKebabCase = (fileName: string): string => {
  return fileName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
};

async function generateAppWebhooksTypes() {
  await Promise.all(
    schemaFileNames.map(async (schemaName) => {
      const fileName = convertToKebabCase(schemaName);
      const schema = JSON.parse(
        readFileSync(path.join(jsonSchemasDir, `${schemaName}.json`), "utf8"),
      ) as JSONSchema;

      const compiledTypes = await compile(schema, fileName, {
        additionalProperties: false,
      });

      writeFileSync(`./generated/app-webhooks-types/${fileName}.ts`, compiledTypes);
    }),
  );
}

try {
  await generateAppWebhooksTypes();
  console.log("Successfully generated TypeScript files from JSON schemas.");
} catch (error) {
  console.error(`Error generating webhook response types: ${error}`);
  process.exit(1);
}
