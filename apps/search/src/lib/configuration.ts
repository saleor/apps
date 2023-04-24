import { useQuery } from "react-query";
import { AlgoliaConfigurationFields } from "./algolia/types";
import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";

export const fetchConfiguration = async (fetch: typeof window.fetch) => {
  const res = await fetch("/api/configuration");
  const data = (await res.json()) as { data?: AlgoliaConfigurationFields };

  return data.data;
};

export const useConfiguration = () => {
  const fetch = useAuthenticatedFetch();

  return useQuery({
    queryKey: ["configuration"],
    queryFn: () => fetchConfiguration(fetch),
  });
};
