import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { useCallback } from "react";
import { useDashboardNotification } from "@saleor/apps-shared";

export const useWebhooksUpdateMutation = () => {
  const fetch: typeof window.fetch = useAuthenticatedFetch();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const queryClient = useQueryClient();

  const mutationFn = useCallback(() => {
    return fetch("/api/recreate-webhooks", { method: "POST" }).then((resp) => {
      if (resp.ok) {
        queryClient.invalidateQueries({ queryKey: ["webhooks-status"] });
        notifySuccess("Webhooks has been updated");
      } else {
        notifyError("Webhooks update failed");
      }
    });
    /**
     * fetch from SDK is not wrapped with memo todo
     */
  }, [fetch, notifyError, notifySuccess, queryClient]);

  return useMutation({
    mutationFn,
  });
};
