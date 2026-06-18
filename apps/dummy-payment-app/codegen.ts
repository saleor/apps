import { type CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  generates: {
    "generated/graphql.ts": {
      schema: "graphql/schema.graphql",
      documents: ["graphql/**/*.graphql", "src/**/*.ts", "src/**/*.tsx"],
      plugins: [
        "typescript",
        "typescript-operations",
        {
          "typescript-urql": {
            documentVariablePrefix: "Untyped",
            fragmentVariablePrefix: "Untyped",
            withHooks: true,
          },
        },
        "typed-document-node",
      ],
      config: {
        dedupeFragments: true,
      },
    },
  },
};

export default config;
