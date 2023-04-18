import { useQuery } from "react-query";
import { AlgoliaConfigurationFields } from "./algolia/types";

export const fetchConfiguration = async (saleorApiUrl: string, token: string) => {
  const res = await fetch("/api/configuration", {
    headers: {
      "authorization-bearer": token,
      "saleor-api-url": saleorApiUrl,
    },
  });
  const data = (await res.json()) as { data?: AlgoliaConfigurationFields };

  return data.data;
};

export const useConfiguration = (saleorApiUrl?: string | undefined, token?: string | undefined) =>
  useQuery({
    queryKey: ["configuration"],
    queryFn: () => fetchConfiguration(saleorApiUrl!, token!),
    enabled: !!token && !!saleorApiUrl,
  });
