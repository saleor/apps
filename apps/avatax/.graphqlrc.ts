import { IGraphQLConfig } from "graphql-config";
const config: IGraphQLConfig = {
  projects: {
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
                "typescript",
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
