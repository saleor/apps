import { FetchCustomersDocument, FetchCustomersQuery } from "../../../generated/graphql";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { ComponentProps, useEffect, useState } from "react";
import { createClient } from "../../lib/create-graphq-client";
import { OperationResult } from "urql";
import { Box, Button, Text, useTheme, WarningIcon } from "@saleor/macaw-ui/next";
import { trpcClient } from "../trpc/trpc-client";

const useFetchAllCustomers = (enabled: boolean) => {
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
  }, [appBridgeState, enabled]);

  return {
    customers,
    totalCustomersCount,
    done,
  };
};

const RootSection = ({ children, ...props }: ComponentProps<typeof Box>) => {
  return (
    <Box
      {...props}
      padding={8}
      borderColor="neutralHighlight"
      borderWidth={1}
      borderStyle="solid"
      borderRadius={4}
    >
      {/* @ts-ignore todo macaw*/}
      <Text as="h1" variant="title" size="small" marginBottom={4}>
        Bulk sync
      </Text>
      {/* @ts-ignore todo macaw*/}
      <Text color="textNeutralSubdued" as="p" marginBottom={8}>
        Scan Saleor customers and send them to Mailchimp
      </Text>
      {children}
    </Box>
  );
};

export const SaleorCustomersList = (props: ComponentProps<typeof Box>) => {
  const [enabled, setEnabled] = useState(false);
  const { customers, totalCustomersCount, done } = useFetchAllCustomers(enabled);
  const theme = useTheme().themeValues;
  const { mutateAsync, status } = trpcClient.mailchimp.audience.bulkAddContacts.useMutation();
  const { appBridge } = useAppBridge();

  useEffect(() => {
    if (done) {
      mutateAsync({
        listId: "31c727eb7e", // todo - list picker
        contacts: customers,
      }).then(() => {
        appBridge!.dispatch(
          actions.Notification({
            status: "success",
            title: "Sync successful",
            text: "Contacts sent to Mailchimp",
          })
        );
      });
    }
  }, [done]);

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

  if (status === "success") {
    // todo add link to the dashboard
    return (
      <RootSection {...props}>
        <Text>Contacts synchronized, check your Mailchimp Dashboard</Text>
      </RootSection>
    );
  }

  if (status === "error") {
    return (
      <RootSection {...props}>
        <Text color="textCriticalSubdued">
          Error synchronizing contacts with Mailchimp, please try again
        </Text>
      </RootSection>
    );
  }

  return (
    <RootSection {...props}>
      {totalCustomersCount && (
        <Box display="flex" gap={4} alignItems="center" marginBottom={8}>
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
      {done && (
        <Box>
          {/* @ts-ignore todo macaw*/}
          <Text as="p" marginBottom={4}>
            Fetched customers from Saleor
          </Text>
          {status === "loading" && <Text as="p">Sending customer to Mailchimp in progress...</Text>}
        </Box>
      )}
    </RootSection>
  );
};
