import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { requestDataJsonSchemas } from "./request-data-json-schemas";

const publicDir = path.resolve(import.meta.dirname, "../../../public/.well-known");

describe("requestDataJsonSchemas", () => {
  it.each(Object.entries(requestDataJsonSchemas))(
    "public/.well-known/%s matches the parser",
    (fileName, schema) => {
      const published: unknown = JSON.parse(readFileSync(path.join(publicDir, fileName), "utf8"));

      expect(
        published,
        "Run `pnpm generate` in apps/stripe to update the published schema",
      ).toStrictEqual(schema);
    },
  );
});
