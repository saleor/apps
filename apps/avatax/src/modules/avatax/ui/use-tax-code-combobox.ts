import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Option } from "@saleor/macaw-ui";
import { useState } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";

const fallbackState: Omit<UseTaxCodeComboboxReturn, "loading"> = {
  options: [] as Option[],
  value: null,
  onChange: () => {},
  onInputValueChange: () => {},
  disabled: true,
};

type UseTaxCodeComboboxReturn = {
  options: Option[];
  loading: boolean;
  value: Option | null;
  onChange: (newValue: Option | null) => void;
  onInputValueChange: (inputValue: string) => void;
  disabled: boolean;
};

export const useTaxCodeCombobox = ({
  taxClassId,
  initialValue,
}: {
  taxClassId: string;
  initialValue: Option | null;
}): UseTaxCodeComboboxReturn => {
  const [filter, setFilter] = useState("");
  const [value, setValue] = useState<Option | null>(initialValue);
  const { notifyError } = useDashboardNotification();

  const { data: taxProviders, isLoading: isTaxProvidersLoading } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const firstConnectionId = taxProviders?.[0]?.id;

  if (!firstConnectionId) {
    notifyError("Error", "No AvaTax connection found. Add a connection first.");

    return {
      ...fallbackState,
      loading: isTaxProvidersLoading,
    };
  }

  const {
    data: taxCodes = [],
    isLoading: isTaxCodesLoading,
    error: taxCodesError,
  } = trpcClient.avataxTaxCodes.getAllForId.useQuery(
    {
      connectionId: firstConnectionId,
      filter,
      /*
       * uniqueKey is needed so we can cache the results per each select, not for all the selects
       * unfortunately, it's impossible to add a custom queryKey to useQuery options https://github.com/trpc/trpc/issues/4989
       */
      uniqueKey: taxClassId,
    },
    {
      enabled: firstConnectionId !== undefined,
      retry: false,
    },
  );

  if (taxCodesError) {
    notifyError("Error", "Unable to fetch AvaTax tax codes. Try again later.");

    return { ...fallbackState, loading: isTaxCodesLoading };
  }

  const options = taxCodes.map((taxCode) => ({
    label: `${taxCode.code} - ${taxCode.description}`,
    value: taxCode.code,
  }));

  const { mutate: upsertTaxCode, isLoading: isUpsertingLoading } =
    trpcClient.avataxMatches.upsert.useMutation();

  const handleChange = (newValue: Option | null) => {
    if (newValue) {
      setValue({ label: newValue.value, value: newValue.value });
      upsertTaxCode({
        saleorTaxClassId: taxClassId,
        avataxTaxCode: newValue.value,
      });
    }
  };

  const handleInputValueChange = (inputValue: string) => {
    setFilter(inputValue);
  };

  return {
    options,
    loading: isTaxCodesLoading || isTaxProvidersLoading || isUpsertingLoading,
    value,
    onChange: handleChange,
    onInputValueChange: handleInputValueChange,
    disabled: false,
  };
};
