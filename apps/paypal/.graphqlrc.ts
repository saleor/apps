import type { IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  projects: {
    app: {
      schema: "./graphql/schema.graphql",
      documents: [
        "./graphql/**/*.graphql",
        "./src/**/*.ts",
        "./src/**/*.tsx",
        "!./src/generated/**/*",
      ],
      extensions: {
        codegen: {
          generates: {
            "./src/generated/graphql.ts": {
              plugins: [
                "typescript",
                "typescript-operations",
                "typed-document-node",
                "typescript-urql",
              ],
              config: {
                scalars: {
                  Date: "string",
                  DateTime: "string",
                  Day: "number",
                  Decimal: "number",
                  GenericScalar: "unknown",
                  JSON: "unknown",
                  JSONString: "string",
                  Metadata: "Record<string, string>",
                  Minute: "number",
                  PositiveDecimal: "number",
                  UUID: "string",
                  Upload: "File",
                  WeightScalar: "number",
                  _Any: "unknown",
                },
                skipTypename: true,
                enumsAsTypes: true,
                futureProofEnums: true,
                dedupeFragments: true,
                nonOptionalTypename: true,
              },
            },
          },
        },
      },
    },
  },
};

export default config;
