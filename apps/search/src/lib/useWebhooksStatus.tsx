import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { useCallback } from "react";
import { OwnWebhookFragment } from "../../generated/graphql";

export const useWebhooksStatus = () => {
  const fetch: typeof window.fetch = useAuthenticatedFetch();

  const fetchFn = useCallback(() => {
    return fetch("/api/webhooks-status").then((resp) => resp.json());
    /**
     * fetch from SDK is not wrapped with memo todo
     */
  }, []);

  return useQuery<OwnWebhookFragment[]>({
    queryKey: ["webhooks-status"],
    queryFn: fetchFn,
  });
};
