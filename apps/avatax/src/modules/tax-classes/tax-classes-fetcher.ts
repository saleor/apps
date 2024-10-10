import { Client } from "urql";

import { readFragment } from "@/graphql";

import { TaxClassFragment } from "../../../graphql/fragments/TaxClass";
import { TaxClassesListQuery } from "../../../graphql/queries/TaxClassesList";

export class TaxClassesFetcher {
  constructor(private client: Client) {}

  fetch() {
    return this.client
      .query(TaxClassesListQuery, {
        /**
         * todo: add pagination
         * * arbitrary limit
         */
        first: 100,
      })
      .toPromise()
      .then((r) => {
        return (
          r.data?.taxClasses?.edges.map(({ node }) => readFragment(TaxClassFragment, node)) ?? []
        );
      });
  }
}
