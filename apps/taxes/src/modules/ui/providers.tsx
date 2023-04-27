import { Box, BoxProps, Button, Text } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { trpcClient } from "../trpc/trpc-client";
import { ProvidersConfig } from "../providers-configuration/providers-config";

const AddProvider = () => {
  const router = useRouter();

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={6}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Text variant="body" __fontWeight={"400"}>
        No providers configured yet
      </Text>
      <Button onClick={() => router.push("/providers/new")}>Add first provider</Button>
    </Box>
  );
};

const ProvidersSkeleton = () => {
  return (
    <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
      Skeleton...
    </Box>
  );
};

const MOCKED_PROVIDERS: ProvidersConfig = [
  {
    provider: "taxjar",
    config: {
      name: "taxjar-1",
      apiKey: "1234",
      isSandbox: true,
    },
    id: "1",
  },
];

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

const ProvidersList = () => {
  const providers = MOCKED_PROVIDERS;

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
        {providers.map((provider) => (
          <Table.TR>
            <Table.TD>{provider.config.name}</Table.TD>
            <Table.TD>{provider.provider}</Table.TD>
            <Table.TD>Active</Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table.Container>
  );
};

export const Providers = () => {
  const { data, isFetching } = trpcClient.providersConfiguration.getAll.useQuery();
  const isProvider = (data?.length ?? 0) > 0;

  return (
    <Box
      borderRadius={4}
      borderWidth={1}
      borderColor={"neutralPlain"}
      borderStyle={"solid"}
      padding={8}
      __minHeight={"320px"}
    >
      {isFetching ? (
        <ProvidersSkeleton />
      ) : (
        // <>{!isProvider ? <AddProvider /> : <ProvidersList />}</>
        <ProvidersList />
      )}
    </Box>
  );
};
