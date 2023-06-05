import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { trpcClient } from "../../trpc/trpc-client";
import { AppCard } from "../../ui/app-card";
import { ProvidersTable } from "../../ui/providers-table";

const AddProvider = () => {
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
      <Text variant="body">No providers configured yet</Text>
      <Button onClick={() => router.push("/providers")}>Add first provider</Button>
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

export const Providers = () => {
  const { data, isFetching, isFetched } = trpcClient.providersConfiguration.getAll.useQuery();
  const router = useRouter();

  const isProvider = (data?.length ?? 0) > 0;
  const isResult = isFetched && isProvider;
  const isNoResult = isFetched && !isProvider;

  return (
    <AppCard __minHeight={"320px"} height="100%">
      {isFetching && <Skeleton />}
      {isNoResult && <AddProvider />}
      {isResult && (
        <Box height="100%" display="flex" flexDirection={"column"} justifyContent={"space-between"}>
          <ProvidersTable />
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Button onClick={() => router.push("/providers")}>Add new</Button>
          </Box>
        </Box>
      )}
    </AppCard>
  );
};
