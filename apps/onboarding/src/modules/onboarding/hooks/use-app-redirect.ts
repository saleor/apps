"use client";

import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useCallback } from "react";

import { type AppRedirectTarget } from "../readiness/redirect-target";

const toTarget = (target: string | AppRedirectTarget): AppRedirectTarget =>
  typeof target === "string" ? { kind: "dashboard", to: target } : target;

/**
 * Navigate the Dashboard chrome: a relative path, or another app by manifest identifier.
 */
export const useAppRedirect = () => {
  const { appBridge } = useAppBridge();

  return useCallback(
    (target: string | AppRedirectTarget) => {
      const resolved = toTarget(target);

      if (resolved.kind === "dashboard") {
        void appBridge?.dispatch(actions.Redirect({ to: resolved.to }));

        return;
      }

      void appBridge
        ?.dispatch(
          actions.RedirectToApp({
            appIdentifier: resolved.appIdentifier,
            path: resolved.path,
          }),
        )
        /*
         * Dashboards that don't handle `redirectToApp` never ack it, so dispatch
         * rejects (negative response or timeout). Keep the CTA useful there.
         */
        .catch(() => appBridge?.dispatch(actions.Redirect({ to: resolved.fallbackTo })));
    },
    [appBridge],
  );
};
