import React from "react";
import { trpcClient } from "../../trpc/trpc-client";
import { Table } from "../../ui/table";
import { ChannelConfig } from "../channel-config";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Select } from "../../ui/_select";

const SelectProvider = (channelConfig: ChannelConfig) => {
  const {
    config: { providerConnectionId = "", slug },
  } = channelConfig;
  const [value, setValue] = React.useState(providerConnectionId);
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { mutate: updateMutation } = trpcClient.channelsConfiguration.upsert.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated channel configuration");
    },
    onError(error) {
      notifyError("Error", error.message);
    },
  });

  const { data: providerConfigurations = [] } = trpcClient.providersConfiguration.getAll.useQuery();

  const changeValue = (nextProviderConnectionId: string) => {
    setValue(nextProviderConnectionId);
    updateMutation({
      providerConnectionId: nextProviderConnectionId === "" ? null : nextProviderConnectionId,
      slug,
    });
  };

  return (
    <Select
      value={value ?? null}
      onChange={(value) => changeValue(String(value))}
      options={[
        { value: "", label: "Not assigned" },
        ...providerConfigurations.map((item) => ({
          value: item.id,
          label: item.config.name,
        })),
      ]}
    />
  );
};

export const ChannelTable = () => {
  const { data = [] } = trpcClient.channelsConfiguration.getAll.useQuery();

  return (
    <Table.Container>
      <Table.THead color={"textNeutralSubdued"}>
        <Table.TR>
          <Table.TH>Channel slug</Table.TH>
          <Table.TH>Provider</Table.TH>
        </Table.TR>
      </Table.THead>
      <Table.TBody>
        {data.map((item) => (
          <Table.TR key={item.id}>
            <Table.TD>{item.config.slug}</Table.TD>
            <Table.TD>
              <SelectProvider {...item} />
            </Table.TD>
          </Table.TR>
        ))}
      </Table.TBody>
    </Table.Container>
  );
};
