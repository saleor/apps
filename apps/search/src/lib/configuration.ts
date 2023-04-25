import { useQuery } from "react-query";
import { AlgoliaConfigurationFields } from "./algolia/types";
import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";

export const fetchConfiguration = async (fetch: typeof window.fetch) => {
  try {
    const res = await fetch("/api/configuration");
    const data = (await res.json()) as { data?: AlgoliaConfigurationFields };

    return data.data;
  } catch (e) {
    throw e;
  }
};

export const useConfiguration = () => {
  const fetch = useAuthenticatedFetch();

  return useQuery({
    queryKey: ["configuration"],
    queryFn: () => fetchConfiguration(fetch),
  });
};
