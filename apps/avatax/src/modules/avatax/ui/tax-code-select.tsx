import { DynamicCombobox, Option } from "@saleor/macaw-ui";
import { useState } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";

export const TaxCodeSelect = ({
  taxClassId,
  initialValue,
}: {
  taxClassId: string;
  initialValue: Option | null;
}) => {
  const [filter, setFilter] = useState("");
  const taxProvidersResult = trpcClient.providersConfiguration.getAll.useQuery();
  const firstConnectionId = taxProvidersResult.data?.[0].id;
  const taxCodesResult = trpcClient.avataxTaxCodes.getAllForId.useQuery(
    {
      connectionId: firstConnectionId!,
      filter,
      uniqueKey: taxClassId,
    },
    {
      enabled: firstConnectionId !== undefined,
      retry: false,
    },
  );

  const options =
    taxCodesResult.data?.map((taxCode) => ({
      label: taxCode.description,
      value: taxCode.code,
    })) ?? [];

  const [value, setValue] = useState<Option | null>(initialValue);

  const { mutate: updateMutation, isLoading: isMutationLoading } =
    trpcClient.avataxMatches.upsert.useMutation();

  return (
    <DynamicCombobox
      options={options}
      loading={taxCodesResult.isLoading || taxProvidersResult.isLoading || isMutationLoading}
      value={value}
      onChange={(value) => {
        if (value) {
          setValue({ label: value.value, value: value.value });
          updateMutation({
            saleorTaxClassId: taxClassId,
            avataxTaxCode: value.value,
          });
        }
      }}
      onInputValueChange={(inputValue) => {
        setFilter(inputValue);
      }}
    />
  );
};
