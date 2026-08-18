import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thrown to abort a Next.js Pages Router transition. The router has no cancel API, so the
 * documented workaround is emitting `routeChangeError` and throwing out of the event handler.
 */
const ABORT_ROUTE_CHANGE = "Abort route change - unsaved changes guard. Safe to ignore.";

export interface UnsavedChangesGuard {
  /** True while a navigation is held back, waiting for the user to confirm. */
  isBlocked: boolean;
  /** Discard the changes and continue to the held-back destination. */
  leave: () => void;
  /** Stay on the page and forget the held-back destination. */
  keepEditing: () => void;
  /**
   * Navigate while bypassing the guard, e.g. right after a successful save when the form is
   * still marked dirty until the mutation settles.
   */
  navigateWithoutGuard: (url: string) => void;
}

/**
 * Holds back in-app navigation while a form has unsaved changes, so the app can render a
 * confirmation (`ExitFormDialog` from `@saleor/apps-ui-next`) instead of losing the edits.
 *
 * Covers everything that goes through the Pages Router: back links, cancel buttons, `Link`
 * clicks and programmatic `router.push`. It cannot cover the user navigating Dashboard itself
 * away from the app — that unmounts the iframe and is not observable here — nor closing the tab:
 * the app iframe is sandboxed without `allow-modals`, so `beforeunload` prompts never show.
 */
export const useUnsavedChangesGuard = ({ enabled }: { enabled: boolean }): UnsavedChangesGuard => {
  const router = useRouter();
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);

  /** Read inside router event handlers, which are registered once. */
  const enabledRef = useRef(enabled);
  const bypassRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (bypassRef.current || !enabledRef.current || url === router.asPath) {
        return;
      }

      setBlockedUrl(url);

      router.events.emit("routeChangeError", ABORT_ROUTE_CHANGE, url, { shallow: false });

      throw ABORT_ROUTE_CHANGE;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router]);

  const navigateWithoutGuard = useCallback(
    (url: string) => {
      bypassRef.current = true;
      void router.push(url).finally(() => {
        bypassRef.current = false;
      });
    },
    [router],
  );

  return {
    isBlocked: blockedUrl !== null,
    leave: useCallback(() => {
      if (!blockedUrl) {
        return;
      }

      setBlockedUrl(null);
      navigateWithoutGuard(blockedUrl);
    }, [blockedUrl, navigateWithoutGuard]),
    keepEditing: useCallback(() => setBlockedUrl(null), []),
    navigateWithoutGuard,
  };
};
