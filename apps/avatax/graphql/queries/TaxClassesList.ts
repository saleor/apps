import { graphql } from "@/graphql";

import { TaxClassFragment } from "../fragments/TaxClass";

export const TaxClassesListQuery = graphql(
  `
    query TaxClassesList(
      $before: String
      $after: String
      $first: Int
      $last: Int
      $filter: TaxClassFilterInput
      $sortBy: TaxClassSortingInput
    ) {
      taxClasses(
        before: $before
        after: $after
        first: $first
        last: $last
        filter: $filter
        sortBy: $sortBy
      ) {
        edges {
          node {
            ...TaxClass
          }
        }
      }
    }
  `,
  [TaxClassFragment],
);
