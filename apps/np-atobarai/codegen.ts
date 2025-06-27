import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  generates: {
    "generated/graphql.ts": {
      schema: "graphql/schema.graphql",
      documents: ["graphql/**/*.graphql"],
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
    },
  },
};

export default config;
