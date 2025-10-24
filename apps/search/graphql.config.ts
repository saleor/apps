import { IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  projects: {
    default: {
      schema: "graphql/schema.graphql",
      documents: ["graphql/**/*.graphql", "src/**/*.ts", "src/**/*.tsx"],
      extensions: {
        codegen: {
          generates: {
            "generated/graphql.ts": {
              config: {
                dedupeFragments: true,
                defaultScalarType: "unknown",
                immutableTypes: false, // TODO: enable this when we fix mutating fragments
                strictScalars: true,
                skipTypename: false, // TODO: enable this when we remove __typename from codebase
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
