#!/usr/bin/env node
/**
 * Downloads the Saleor GraphQL schema and the sync webhook response JSON schemas apps generate
 * types from, pinned to `config.saleor.schemaVersion`. Apps read these files; none fetch their own.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { schemaVersion } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).config
  .saleor as { schemaVersion: string };

const baseUrl = `https://raw.githubusercontent.com/saleor/saleor/${schemaVersion}/saleor`;

// Union of the schemas apps compile in their `generate:app-webhooks-types` scripts.
const jsonSchemaNames = [
  "ListStoredPaymentMethods",
  "PaymentGatewayInitializeSession",
  "StoredPaymentMethodDeleteRequested",
  "TransactionCancelationRequested",
  "TransactionChargeRequested",
  "TransactionInitializeSession",
  "TransactionProcessSession",
  "TransactionRefundRequested",
];

const download = async (url: string, file: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Could not fetch ${url}: ${res.status} ${res.statusText}`);
  }

  writeFileSync(path.join(root, file), await res.text());
};

mkdirSync(path.join(root, "saleor-json-schemas"), { recursive: true });

await Promise.all([
  download(`${baseUrl}/graphql/schema.graphql`, "schema.graphql"),
  ...jsonSchemaNames.map((name) =>
    download(`${baseUrl}/json_schemas/${name}.json`, `saleor-json-schemas/${name}.json`),
  ),
]);
