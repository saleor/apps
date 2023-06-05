import { Box, Button } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { ProviderConfig } from "../providers-configuration/providers-config";
import { trpcClient } from "../trpc/trpc-client";
import { ProviderLabel } from "./provider-label";

const Table = {
  Container: (props: BoxProps) => <Box __textAlign={"left"} width="100%" {...props} as="table" />,
  THead: (props: BoxProps) => <Box {...props} as="thead" />,
  TR: (props: BoxProps) => <Box {...props} as="tr" />,
  TH: (props: BoxProps) => (
    <Box fontWeight={"captionSmall"} fontSize={"captionSmall"} {...props} as="th" />
  ),
  TBody: (props: BoxProps) => <Box {...props} as="tbody" />,
  TD: (props: BoxProps) => <Box fontSize="bodyMedium" paddingY={4} {...props} as="td" />,
};

export const ProvidersTable = () => {
  const router = useRouter();
  const { data } = trpcClient.providersConfiguration.getAll.useQuery();

  const itemClickHandler = (item: ProviderConfig) => {
    router.push(`/providers/${item.provider}/${item.id}`);
  };

  return (
    <Table.Container>
      <Table.THead color={"textNeutralSubdued"}>
        <Table.TR>
          <Table.TH>Name</Table.TH>
          <Table.TH>Provider</Table.TH>
        </Table.TR>
      </Table.THead>
      <Table.TBody>
        {data?.map((item) => (
          <Table.TR>
            <Table.TD>{item.config.name}</Table.TD>
            <Table.TD>
              <ProviderLabel name={item.provider} />
            </Table.TD>
            <Table.TD onClick={() => itemClickHandler(item)}>
              <Box display={"flex"} justifyContent={"flex-end"}>
                <Button variant="tertiary">Edit</Button>
              </Box>
            </Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table.Container>
  );
};
