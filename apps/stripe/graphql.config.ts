import { IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  projects: {
    e2e: {
      schema: "graphql/schema.graphql",
      documents: ["e2e/**/*.graphql"],
      extensions: {
        codegen: {
          generates: {
            "e2e/generated/graphql.ts": {
              plugins: [
                {
                  typescript: {
                    enumsAsTypes: true,
                  },
                },
                "typescript-operations",
                "typed-document-node",
              ],
            },
          },
        },
      },
    },
    default: {
      schema: "graphql/schema.graphql",
      documents: ["graphql/**/*.graphql"],
      extensions: {
        codegen: {
          generates: {
            "generated/graphql.ts": {
              config: {
                dedupeFragments: true,
                defaultScalarType: "unknown",
                immutableTypes: true,
                strictScalars: true,
                skipTypename: true,
                scalars: {
                  _Any: "unknown",
                  Date: "string",
                  DateTime: "string",
                  Decimal: "number",
                  Minute: "number",
                  GenericScalar: "JSONValue",
                  JSON: "JSONValue",
                  JSONString: "string",
                  Metadata: "Record<string, string>",
                  PositiveDecimal: "number",
                  Upload: "unknown",
                  UUID: "string",
                  WeightScalar: "number",
                  Day: "string",
                  Hour: "number",
                },
              },
              plugins: [
                {
                  add: {
                    content:
                      "type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];",
                  },
                },
                {
                  typescript: {
                    enumsAsTypes: true,
                  },
                },
                "typescript-operations",
                {
                  "typescript-urql": {
                    documentVariablePrefix: "Untyped",
                    fragmentVariablePrefix: "Untyped",
                    withHooks: false,
                  },
                },
                "typed-document-node",
              ],
            },
          },
        },
      },
    },
  },
};

export default config;
