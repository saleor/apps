import { Client } from "urql";

import {
  TaxClassesListDocument,
  TaxClassesListQueryVariables,
  TaxClassFragment,
} from "../../../generated/graphql";

export class TaxClassesFetcher {
  constructor(private client: Client) {}

  fetch(): Promise<TaxClassFragment[]> {
    return this.client
      .query(TaxClassesListDocument, {
        /**
         * todo: add pagination
         * * arbitrary limit
         */
        first: 100,
      } as TaxClassesListQueryVariables)
      .toPromise()
      .then((r) => {
        return r.data?.taxClasses?.edges.map(({ node }) => node) ?? [];
      });
  }
}
