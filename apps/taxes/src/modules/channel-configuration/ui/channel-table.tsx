import { Select } from "@saleor/macaw-ui/next";
import React from "react";
import { trpcClient } from "../../trpc/trpc-client";
import { Table } from "../../ui/table";
import { ChannelConfig } from "../channel-config";
import { useDashboardNotification } from "@saleor/apps-shared";

const SelectProvider = (channelConfig: ChannelConfig) => {
  const {
    config: { providerInstanceId = "", slug },
    id,
  } = channelConfig;
  const [value, setValue] = React.useState(providerInstanceId);
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { mutate: upsertMutation } = trpcClient.channelsConfiguration.upsert.useMutation({
    onSuccess() {
      notifySuccess("Success", "Updated channel configuration");
    },
    onError(error) {
      notifyError("Error", error.message);
    },
  });

  const { data: providerConfigurations = [] } = trpcClient.providersConfiguration.getAll.useQuery();

  const changeValue = (nextProviderInstanceId: string) => {
    setValue(nextProviderInstanceId);
    upsertMutation({
      id,
      config: {
        providerInstanceId: nextProviderInstanceId,
        slug,
      },
    });
  };

  return (
    <Select
      value={value ?? ""}
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
  const { data = [] } = trpcClient.channelsConfiguration.fetch.useQuery();

  return (
    <Table.Container>
      <Table.THead color={"textNeutralSubdued"}>
        <Table.TR>
          <Table.TH>Slug</Table.TH>
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
