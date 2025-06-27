/* eslint-disable no-console */
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

import { compile, type JSONSchema } from "json-schema-to-typescript";

const {
  values: { "json-schema-version": jsonSchemaVersion },
} = parseArgs({
  options: {
    "json-schema-version": {
      type: "string",
      default: "main",
    },
  },
});

const schemaFileNames = [
  "PaymentGatewayInitializeSession",
  "TransactionInitializeSession",
  "TransactionRefundRequested",
];

const path = `https://raw.githubusercontent.com/saleor/saleor/${jsonSchemaVersion}/saleor/json_schemas/`;

const convertToKebabCase = (fileName: string): string => {
  return fileName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");
};

const schemaMapping = schemaFileNames.map((fileName) => ({
  fileName: convertToKebabCase(fileName),
  url: `${path}${fileName}.json`,
}));

async function generateAppWebhooksTypes() {
  await Promise.all(
    schemaMapping.map(async ({ fileName, url }) => {
      const res = await fetch(url);

      const fetchedSchema = (await res.json()) as JSONSchema;

      const compiledTypes = await compile(fetchedSchema, fileName, {
        additionalProperties: false,
      });

      writeFileSync(`./generated/app-webhooks-types/${fileName}.ts`, compiledTypes);
    }),
  );
}

try {
  console.log("Fetching JSON schemas from Saleor GitHub repository...");
  await generateAppWebhooksTypes();
  console.log("Successfully generated TypeScript files from JSON schemas.");
} catch (error) {
  console.error(`Error generating webhook response types: ${error}`);
  process.exit(1);
}
