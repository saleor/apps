/* eslint-disable import/no-default-export */
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://demo.saleor.io/graphql/",
  documents: ["src/saleor-api/operations/*.ts"],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/saleor-api/generated/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
};

export default config;
