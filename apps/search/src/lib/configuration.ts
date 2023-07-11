import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { AppConfigurationFields } from "../domain/configuration";

export const fetchConfiguration = async (fetch: typeof window.fetch) => {
  try {
    const res = await fetch("/api/configuration");
    const data = (await res.json()) as { data?: AppConfigurationFields };

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
