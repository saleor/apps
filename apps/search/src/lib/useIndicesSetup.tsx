import { useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { useCallback } from "react";
import { useDashboardNotification } from "@saleor/apps-shared";

export const useIndicesSetupMutation = () => {
  const fetch: typeof window.fetch = useAuthenticatedFetch();
  const { notifyError, notifySuccess } = useDashboardNotification();

  const mutationFn = useCallback(() => {
    return fetch("/api/setup-indices", { method: "POST" }).then((resp) => {
      if (resp.ok) {
        notifySuccess("Settings has been updated");
      } else {
        notifyError("Settings update failed");
      }
    });
    /**
     * fetch from SDK is not wrapped with memo todo
     */
  }, [fetch, notifyError, notifySuccess]);

  return useMutation({
    mutationFn,
  });
};
