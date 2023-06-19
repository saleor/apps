import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect, useState } from "react";
import { FetchCustomersDocument, FetchCustomersQuery } from "../../../generated/graphql";
import { OperationResult } from "urql";
import { metadataToMailchimpTags } from "./metadata-to-mailchimp-tags";
import { createGraphQLClient } from "@saleor/apps-shared";

type CustomerCollectionItem = {
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
};

export const useFetchAllCustomers = (enabled: boolean) => {
  const { appBridgeState } = useAppBridge();
  const [customers, setCustomers] = useState<Array<CustomerCollectionItem>>([]);
  const [totalCustomersCount, setTotalCustomersCount] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  if (!appBridgeState) {
    throw new Error("Must be used withing AppBridgeProvider");
  }

  useEffect(() => {
    if (!appBridgeState.token || !appBridgeState.saleorApiUrl) {
      return;
    }

    const client = createGraphQLClient({
      saleorApiUrl: appBridgeState.saleorApiUrl,
      token: appBridgeState.token,
    });

    const fetchPage = (cursor?: string) =>
      client.query(FetchCustomersDocument, { cursor }).toPromise();

    const fetchAll = async () => {
      let allFetched = false;
      let lastCursor: string | undefined = undefined;

      while (!allFetched) {
        const results: OperationResult<FetchCustomersQuery> = await fetchPage(lastCursor);

        if (!results.data) {
          return;
        }

        if (!totalCustomersCount) {
          setTotalCustomersCount(results.data?.customers?.totalCount ?? null);
        }

        allFetched = !Boolean(results.data?.customers?.pageInfo.hasNextPage);
        lastCursor = results.data?.customers?.pageInfo.endCursor ?? undefined;

        setCustomers((current) => {
          const newCustomers = results.data!.customers!.edges.map((c): CustomerCollectionItem => {
            const tags = metadataToMailchimpTags(c.node);

            return {
              email: c.node.email,
              lastName: c.node.lastName,
              firstName: c.node.firstName,
              tags,
            };
          });

          return [...current, ...newCustomers];
        });
      }
    };

    if (enabled) {
      fetchAll().then(() => {
        setDone(true);
      });
    }
  }, [appBridgeState, enabled, totalCustomersCount]);

  return {
    customers,
    totalCustomersCount,
    done,
  };
};
