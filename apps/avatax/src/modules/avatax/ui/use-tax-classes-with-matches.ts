import { Option } from "@saleor/macaw-ui";

import { trpcClient } from "../../trpc/trpc-client";

export const useTaxClassesWithMatches = () => {
  const { data: taxClasses = [], isLoading: taxClassesLoading } =
    trpcClient.taxClasses.getAll.useQuery();
  const { data: taxMatches, isLoading: taxMatchesLoading } =
    trpcClient.avataxMatches.getAll.useQuery();

  const findOptionMatchForTaxClass = (taxClassId: string): Option | null => {
    const possibleMatch = taxMatches?.find((item) => item.data.saleorTaxClassId === taxClassId);

    if (possibleMatch) {
      return {
        label: possibleMatch.data.avataxTaxCode,
        value: possibleMatch.data.avataxTaxCode,
      };
    } else {
      return null;
    }
  };

  return {
    taxClasses,
    isLoading: taxClassesLoading || taxMatchesLoading,
    findOptionMatchForTaxClass,
  };
};
