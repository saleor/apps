import { IGraphQLConfig } from "graphql-config";
const config: IGraphQLConfig = {
  projects: {
    e2e: {
      schema: "graphql/schema.graphql",
      documents: ["e2e/**/*.graphql"],
      extensions: {
        codegen: {
          generates: {
            // Export all Saleor scalar types into separate types.ts file
            "e2e/generated/types.ts": {
              plugins: ["typescript"],
            },
            // Export all queries and mutations into separate file, use Saleor types from types.ts
            "e2e/generated/graphql.ts": {
              preset: "import-types",
              plugins: ["typescript-operations", "typescript-document-nodes"],
              presetConfig: {
                typesPath: "./types",
              },
              config: {
                // Export operations into raw string with `gql` used in template literals
                rawRequest: true,
                // We don't want to use `graphql-tag` for parsing of strings into AST
                // because PactumJS expects string as input to requests
                gqlImport: "../utils#gql",
              },
            },
          },
        },
      },
    },
    default: {
      schema: "graphql/schema.graphql",
      documents: [
        "graphql/**/*.graphql",
        "src/**/*.ts",
        "src/**/*.tsx",
        "scripts/migrations/**/*.ts",
      ],
      extensions: {
        codegen: {
          generates: {
            "generated/graphql.ts": {
              plugins: [
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
