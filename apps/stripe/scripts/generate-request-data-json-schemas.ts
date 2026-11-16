/* eslint-disable no-console */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { requestDataJsonSchemas } from "../src/modules/request-data-json-schemas/request-data-json-schemas";

const outputDir = path.resolve(import.meta.dirname, "../public/.well-known");

const files = Object.entries(requestDataJsonSchemas).map(([fileName, schema]) => {
  const file = path.join(outputDir, fileName);

  writeFileSync(file, JSON.stringify(schema));
  console.log(`Wrote public/.well-known/${fileName}`);

  return file;
});

execFileSync("prettier", ["--write", ...files], { stdio: "inherit" });
