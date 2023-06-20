import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { trpcClient } from "../../trpc/trpc-client";
import { AppCard } from "../../ui/app-card";
import { ChannelTable } from "./channel-table";

const NoChannelConfigured = () => {
  const appBridge = useAppBridge();

  const redirectToTaxes = () => {
    appBridge.appBridge?.dispatch(actions.Redirect({ to: "/taxes/channels" }));
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={6}
      alignItems={"center"}
      height={"100%"}
      justifyContent={"center"}
    >
      <Text variant="body">No channels configured yet</Text>
      <Button onClick={redirectToTaxes}>Configure channels</Button>
    </Box>
  );
};

const Skeleton = () => {
  // todo: replace with skeleton
  return (
    <Box height={"100%"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
      <Text color="textNeutralSubdued">Loading...</Text>
    </Box>
  );
};

export const ChannelList = () => {
  const { data = [], isFetching, isFetched } = trpcClient.channelsConfiguration.getAll.useQuery();

  const isAnyChannelConfigured = data.length > 0;
  const isResult = isFetched && isAnyChannelConfigured;
  const isEmpty = isFetched && !isAnyChannelConfigured;

  return (
    <AppCard __minHeight={"320px"} height="100%">
      {isFetching ? (
        <Skeleton />
      ) : (
        <>
          {isEmpty && <NoChannelConfigured />}
          {isResult && (
            <Box height="100%">
              <ChannelTable />
            </Box>
          )}
        </>
      )}
    </AppCard>
  );
};
