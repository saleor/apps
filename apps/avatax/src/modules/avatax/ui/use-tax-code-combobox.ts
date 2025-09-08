import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { Option } from "@saleor/macaw-ui";
import { useEffect, useState } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";

type UseTaxCodeComboboxReturn = {
  options: Option[];
  loading: boolean;
  value: Option | null;
  onChange: (newValue: Option | null) => void;
  onInputValueChange: (inputValue: string) => void;
  errorMessage: string | null;
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
  const { notifySuccess, notifyError } = useDashboardNotification();

  const { data: taxProviders, isLoading: isTaxProvidersLoading } =
    trpcClient.providersConfiguration.getAll.useQuery();

  const firstConnectionId = taxProviders?.[0]?.id;

  const {
    data: taxCodes = [],
    isLoading: isTaxCodesLoading,
    error: taxCodesError,
  } = trpcClient.avataxTaxCodes.getAllForId.useQuery(
    {
      connectionId: firstConnectionId || "",
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

  const { mutate: upsertTaxCode, isLoading: isUpsertingLoading } =
    trpcClient.avataxMatches.upsert.useMutation({
      onSuccess: () => notifySuccess("Success", "Updated AvaTax tax code match"),
      onError: (error) => notifyError("Error", error.message),
    });

  const options = taxCodes.map((taxCode) => ({
    label: `${taxCode.code} - ${taxCode.description}`,
    value: taxCode.code,
  }));

  // Format initial value with description when tax codes are loaded
  useEffect(() => {
    if (initialValue && taxCodes.length > 0) {
      const matchingTaxCode = taxCodes.find((taxCode) => taxCode.code === initialValue.value);

      if (matchingTaxCode && initialValue.label === initialValue.value) {
        // Only update if the label is just the code (not already formatted)
        setValue({
          label: `${matchingTaxCode.code} - ${matchingTaxCode.description}`,
          value: matchingTaxCode.code,
        });
      }
    }
  }, [initialValue, taxCodes]);

  const handleChange = (newValue: Option | null) => {
    if (newValue) {
      setValue(newValue);
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
    errorMessage: taxCodesError ? taxCodesError.message : null,
  };
};
