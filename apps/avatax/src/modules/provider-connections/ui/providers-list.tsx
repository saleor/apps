import { Box, Button, Skeleton, Text } from "@saleor/macaw-ui";
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
      <Text>No configurations created yet</Text>
      <Button
        data-testid="no-providers-list-add-button"
        onClick={() => router.push("/providers/avatax")}
      >
        Add first configuration
      </Button>
    </Box>
  );
};

export const ProvidersList = () => {
  const { data, isFetching, isFetched } = trpcClient.providersConfiguration.getAll.useQuery();
  const router = useRouter();

  const isProvider = (data?.length ?? 0) > 0;
  const isResult = isFetched && isProvider;
  const isNoResult = isFetched && !isProvider;

  return (
    <AppCard __minHeight={"320px"} height="100%" data-testid="providers-list">
      {isFetching ? (
        <Skeleton />
      ) : (
        <>
          {isNoResult && <AddProvider />}
          {isResult && (
            <Box
              height="100%"
              display="flex"
              flexDirection={"column"}
              justifyContent={"space-between"}
            >
              <ProvidersTable />
              <Box display={"flex"} justifyContent={"flex-end"}>
                <Button
                  data-testid="providers-list-add-button"
                  onClick={() => router.push("/providers")}
                >
                  Add new
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </AppCard>
  );
};
