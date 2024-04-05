import { Box, Button, EditIcon } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import { ProviderConnection } from "../provider-connections/provider-connections";
import { trpcClient } from "../trpc/trpc-client";
import { ProviderLabel } from "./provider-label";
import { Table } from "./table";

export const ProvidersTable = () => {
  const router = useRouter();
  const { data } = trpcClient.providersConfiguration.getAll.useQuery();

  const editClickHandler = (item: ProviderConnection) => {
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
            <Table.TD>
              <Box display={"flex"} justifyContent={"flex-end"} gap={2}>
                <Button
                  onClick={() => editClickHandler(item)}
                  icon={<EditIcon />}
                  data-testid="provider-edit-button"
                  variant="secondary"
                >
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
