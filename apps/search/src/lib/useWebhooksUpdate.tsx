import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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
