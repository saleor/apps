import { Box, BoxProps, Button, Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { trpcClient } from "../trpc/trpc-client";
import { AppCard } from "./app-card";

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
      <Text variant="body" __fontWeight={"400"}>
        No providers configured yet
      </Text>
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

const Table = {
  Container: (props: BoxProps) => <Box __textAlign={"left"} width="100%" {...props} as="table" />,
  THead: (props: BoxProps) => <Box {...props} as="thead" />,
  TR: (props: BoxProps) => <Box {...props} as="tr" />,
  TH: (props: BoxProps) => (
    <Box fontWeight={"captionSmall"} fontSize={"captionSmall"} {...props} as="th" />
  ),
  TBody: (props: BoxProps) => <Box {...props} as="tbody" />,
  TD: (props: BoxProps) => <Box fontSize="bodyMedium" {...props} as="td" />,
};

const ProvidersTable = () => {
  const { data } = trpcClient.providersConfiguration.getAll.useQuery();

  return (
    <Table.Container>
      <Table.THead color={"textNeutralSubdued"}>
        <Table.TR>
          <Table.TH>Name</Table.TH>
          <Table.TH>Provider</Table.TH>
          <Table.TH>Status</Table.TH>
        </Table.TR>
      </Table.THead>
      <Table.TBody>
        {data?.map((item) => (
          <Table.TR>
            <Table.TD>{item.config.name}</Table.TD>
            <Table.TD>{item.provider}</Table.TD>
            <Table.TD>{"Status"}</Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table.Container>
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
        <>
          <ProvidersTable />
          <Box>
            <Button onClick={() => router.push("/providers")}>Add new</Button>
          </Box>
        </>
      )}
    </AppCard>
  );
};
