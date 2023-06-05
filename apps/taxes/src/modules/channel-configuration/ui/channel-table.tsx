import { trpcClient } from "../../trpc/trpc-client";
import { Table } from "../../ui/table";

export const ChannelTable = () => {
  const { data } = trpcClient.channelsConfiguration.fetch.useQuery();

  if (!data) return null;

  return (
    <Table.Container>
      <Table.THead color={"textNeutralSubdued"}>
        <Table.TR>
          <Table.TH>Slug</Table.TH>
        </Table.TR>
      </Table.THead>
      <Table.TBody>
        {Object.entries(data).map(([slug]) => (
          <Table.TR>
            <Table.TD>{slug}</Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table.Container>
  );
};
