"use client";

import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useCallback } from "react";

/**
 * Wrap AppBridge's Redirect action so widget buttons can navigate the dashboard's outer route.
 */
export const useAppRedirect = () => {
  const { appBridge } = useAppBridge();

  return useCallback(
    (to: string) => {
      void appBridge?.dispatch(actions.Redirect({ to }));
    },
    [appBridge],
  );
};
