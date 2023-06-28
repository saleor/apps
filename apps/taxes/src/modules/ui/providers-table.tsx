import { Box, Button } from "@saleor/macaw-ui/next";
import { useRouter } from "next/router";
import { ProviderConnection } from "../provider-connections/provider-connections";
import { trpcClient } from "../trpc/trpc-client";
import { ProviderLabel } from "./provider-label";
import { Table } from "./table";

export const ProvidersTable = () => {
  const router = useRouter();
  const { data } = trpcClient.providersConfiguration.getAll.useQuery();

  const itemClickHandler = (item: ProviderConnection) => {
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
          <Table.TR key={item.id}>
            <Table.TD>{item.config.name}</Table.TD>
            <Table.TD>
              <ProviderLabel name={item.provider} />
            </Table.TD>
            <Table.TD onClick={() => itemClickHandler(item)}>
              <Box display={"flex"} justifyContent={"flex-end"}>
                <Button data-testid="provider-edit-button" variant="tertiary">
                  Edit
                </Button>
              </Box>
            </Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table.Container>
  );
};
