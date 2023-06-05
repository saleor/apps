import { trpcClient } from "../../trpc/trpc-client";
import { Table } from "../../ui/table";

export const ChannelTable = () => {
  const { data } = trpcClient.channels.fetch.useQuery();

  return (
    <Table.Container>
      <Table.THead color={"textNeutralSubdued"}>
        <Table.TR>
          <Table.TH>Slug</Table.TH>
        </Table.TR>
      </Table.THead>
      <Table.TBody>
        {data?.map((item) => (
          <Table.TR>
            <Table.TD>{item.slug}</Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table.Container>
  );
};
