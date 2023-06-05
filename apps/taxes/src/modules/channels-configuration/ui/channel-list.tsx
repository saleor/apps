import React from "react";
import { trpcClient } from "../../trpc/trpc-client";
import { AppCard } from "../../ui/app-card";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import router, { useRouter } from "next/router";
import { ProvidersTable } from "../../ui/providers-table";
import { ChannelTable } from "./channel-table";

const NoChannelConfigured = () => {
  const router = useRouter();

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
      <Button onClick={() => router.push("/providers")}>Configure channel to use tax app</Button>
    </Box>
  );
};

const Skeleton = () => {
  // todo: replace with skeleton
  return (
    <Box height={"100%"} display={"flex"} alignItems={"center"} justifyContent={"center"}>
      Loading...
    </Box>
  );
};

export const ChannelList = () => {
  const { data, isFetching, isFetched } = trpcClient.channels.fetch.useQuery();

  const isProvider = (data?.length ?? 0) > 0;
  const isResult = isFetched && isProvider;
  const isNoResult = isFetched && !isProvider;

  return (
    <AppCard __minHeight={"320px"} height="100%">
      {isFetching && <Skeleton />}
      {isNoResult && <NoChannelConfigured />}
      {isResult && (
        <Box height="100%">
          <ChannelTable />
        </Box>
      )}
    </AppCard>
  );
};
