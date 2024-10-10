import { initGraphQLTada } from "gql.tada";

import type { introspection } from "./graphql-env.d.ts";

// todo eslint prevent import graphql from not this file
export const graphql = initGraphQLTada<{
  introspection: introspection;
  disableMasking: true;
}>();

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
export { readFragment } from "gql.tada";
