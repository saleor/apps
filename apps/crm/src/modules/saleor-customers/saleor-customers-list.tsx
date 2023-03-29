import {
  FetchCustomersDocument,
  FetchCustomersQuery,
  useFetchCustomersQuery,
} from "../../../generated/graphql";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { ComponentProps, useEffect, useState } from "react";
import { createClient } from "../../lib/create-graphq-client";
import { OperationResult } from "urql";
import { Box, Text, Button, WarningIcon, useTheme } from "@saleor/macaw-ui/next";

const useFetchAllCustomers = (enabled: boolean) => {
  const { appBridgeState } = useAppBridge();
  const [customers, setCustomers] = useState<Array<{ email: string }>>([]);
  const [totalCustomersCount, setTotalCustomersCount] = useState<number | null>(null);

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
      fetchAll();
    }
  }, [appBridgeState, enabled]);

  return {
    customers,
    totalCustomersCount,
  };
};

const RootSection = ({ children, ...props }: ComponentProps<typeof Box>) => {
  return (
    <Box {...props} padding={8} backgroundColor="subdued" borderRadius={4}>
      <Text as="h1" variant="title" marginBottom={4}>
        Bulk sync
      </Text>
      <Text color="textNeutralSubdued" as="p" marginBottom={8}>
        Scan Saleor customers and send them to Mailchimp
      </Text>
      {children}
    </Box>
  );
};

export const SaleorCustomersList = (props: ComponentProps<typeof Box>) => {
  const [enabled, setEnabled] = useState(false);
  const { customers, totalCustomersCount } = useFetchAllCustomers(enabled);
  const theme = useTheme().themeValues;

  if (!enabled) {
    return (
      <RootSection {...props}>
        <Box display="flex" marginBottom={6} gap={4}>
          <WarningIcon />
          <Text as="p">Do not close the app while indexing</Text>
        </Box>
        <Button onClick={() => setEnabled(true)}>Start</Button>
      </RootSection>
    );
  }

  return (
    <RootSection {...props}>
      {totalCustomersCount && (
        <Box display="flex" gap={4} alignItems="center">
          <progress
            style={{
              height: 30,
            }}
            color={theme.colors.foreground.iconBrandSubdued}
            max={totalCustomersCount}
            value={customers.length}
          />
          <Text>Synchronizing total {totalCustomersCount} accounts...</Text>
        </Box>
      )}
    </RootSection>
  );
};
