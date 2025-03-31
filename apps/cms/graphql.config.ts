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
              },
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
