import { IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  projects: {
    default: {
      schema: "graphql/schema.graphql",
      documents: ["graphql/**/*.graphql", "src/**/*.ts", "src/**/*.tsx"],
      extensions: {
        codegen: {
          ignoreNoDocuments: true,
          generates: {
            "generated/graphql.ts": {
              config: {
                dedupeFragments: true,
                defaultScalarType: "unknown",
                immutableTypes: true,
                strictScalars: true,
                skipTypename: true,
                omitObjectTypes: true,
                preResolveTypes: true,
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
                  PositiveInt: "number",
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
                  "graphql-codegen-typescript-operation-types": {
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
  },
};

export default config;
