import { type IGraphQLConfig } from "graphql-config";

const config: IGraphQLConfig = {
  schema: "graphql/schema.graphql",
  documents: ["graphql/**/*.graphql", "src/**/*.ts", "src/**/*.tsx"],
  extensions: {
    codegen: {
      overwrite: true,
      generates: {
        "generated/graphql.ts": {
          config: {
            dedupeFragments: true,
          },
          plugins: ["typescript", "typescript-operations", "typed-document-node"],
        },
      },
    },
  },
};

export default config;
