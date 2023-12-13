import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, Input, Spinner } from "@saleor/macaw-ui";
import { useRouter } from "next/router";
import React from "react";
import { useDebounce } from "usehooks-ts";
import { trpcClient } from "../../trpc/trpc-client";

const useGetTaxCodes = ({ filter, uniqueKey }: { filter: string | null; uniqueKey: string }) => {
  const { data: providers, isFetched } = trpcClient.providersConfiguration.getAll.useQuery();
  const { notifyError } = useDashboardNotification();
  const router = useRouter();

  /*
   * Tax Code Matcher is only available when there is at least one connection.
   * The reason for it is that we need any working credentials to fetch the provider tax codes.
   */
  const firstConnectionId = providers?.[0].id;

  if (isFetched && !firstConnectionId) {
    notifyError("Error", "No AvaTax connection found.");
    setTimeout(() => {
      router.push("/configuration");
    }, 1000);
  }

  /*
   * uniqueKey is needed so we can cache the results per each select, not for all the selects
   * unfortunately, it's impossible to add a custom queryKey to useQuery options https://github.com/trpc/trpc/issues/4989
   */
  const result = trpcClient.avataxTaxCodes.getAllForId.useQuery(
    {
      connectionId: firstConnectionId!,
      filter,
      uniqueKey,
    },
    {
      enabled: firstConnectionId !== undefined,
    },
  );

  React.useEffect(() => {
    if (result.error) {
      notifyError("Error", "Unable to fetch AvaTax tax codes.");
      setTimeout(() => {
        router.push("/configuration");
      }, 1000);
    }
  }, [notifyError, result.error, router]);

  return result;
};

const useTaxCodeAutocomplete = ({ taxClassId }: { taxClassId: string }) => {
  const [isTouched, setIsTouched] = React.useState(false);
  const [value, setValue] = React.useState("");
  const prevValueRef = React.useRef("");
  const { notifySuccess, notifyError } = useDashboardNotification();

  const debouncedValue = useDebounce(value, 1000);
  const {
    data: taxCodes = [],
    isLoading: isCodesLoading,
    isInitialLoading: isCodesInitialLoading,
  } = useGetTaxCodes({ filter: debouncedValue, uniqueKey: taxClassId });

  const changeValue = (newValue: string) => {
    setIsTouched(true);
    setValue(newValue);
  };

  const { data: avataxMatches = [], isInitialLoading: isMatchesInitialLoading } =
    trpcClient.avataxMatches.getAll.useQuery();

  const { mutate: updateMutation, isLoading: isMutationLoading } =
    trpcClient.avataxMatches.upsert.useMutation({
      onSuccess: () => notifySuccess("Success", "Updated AvaTax tax code matches"),
      onError: (error) => notifyError("Error", error.message),
    });

  const updateTaxCode = React.useCallback(() => {
    const isValidCode =
      taxCodes.some((item) => item.code === debouncedValue) || debouncedValue === "";

    if (debouncedValue !== prevValueRef.current && isTouched && isValidCode) {
      prevValueRef.current = debouncedValue;
      updateMutation({ saleorTaxClassId: taxClassId, avataxTaxCode: debouncedValue });
    }
  }, [debouncedValue, isTouched, taxCodes, taxClassId, updateMutation]);

  React.useEffect(() => {
    const match = avataxMatches.find((item) => item.data.saleorTaxClassId === taxClassId);

    if (match && !isTouched) {
      setValue(match.data.avataxTaxCode);
      prevValueRef.current = match.data.avataxTaxCode;
    }

    updateTaxCode();
  }, [avataxMatches, isTouched, taxClassId, updateTaxCode]);

  return {
    inputText: value,
    onInputTextChange: changeValue,
    options: taxCodes,
    isInputDisabled: isCodesInitialLoading || isMatchesInitialLoading,
    isInputLoading: isMutationLoading || isCodesLoading,
  };
};

// todo: replace with macaw-ui Autocomplete component when it's ready
export const TaxCodeSelect = ({ taxClassId }: { taxClassId: string }) => {
  const { isInputLoading, isInputDisabled, inputText, onInputTextChange, options } =
    useTaxCodeAutocomplete({
      taxClassId,
    });

  return (
    <label>
      <Box display={"flex"} gap={1} alignItems={"center"}>
        <Input
          name="taxCode"
          disabled={isInputDisabled}
          list="taxCodes"
          value={inputText}
          onChange={(e) => onInputTextChange(e.target.value)}
        />
        {isInputLoading && <Spinner />}
      </Box>
      <datalist id="taxCodes">
        {options.map((taxCode) => (
          <option key={taxCode.code} value={taxCode.code}>
            {taxCode.description}
          </option>
        ))}
      </datalist>
    </label>
  );
};
