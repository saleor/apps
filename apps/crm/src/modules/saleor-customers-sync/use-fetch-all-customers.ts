import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/create-graphq-client";
import { FetchCustomersDocument, FetchCustomersQuery } from "../../../generated/graphql";
import { OperationResult } from "urql";

export const useFetchAllCustomers = (enabled: boolean) => {
  const { appBridgeState } = useAppBridge();
  const [customers, setCustomers] = useState<Array<{ email: string }>>([]);
  const [totalCustomersCount, setTotalCustomersCount] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  if (!appBridgeState) {
    throw new Error("Must be used withing AppBridgeProvider");
  }

  useEffect(() => {
    if (!appBridgeState.token || !appBridgeState.saleorApiUrl) {
      return;
    }

    const client = createClient(appBridgeState.saleorApiUrl, async () => ({
      token: appBridgeState.token!,
    }));

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
          const newCustomers = results.data!.customers!.edges.map((c) => {
            return { email: c.node.email };
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
