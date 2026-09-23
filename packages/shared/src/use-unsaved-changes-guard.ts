import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thrown to abort a Next.js Pages Router transition. The router has no cancel API, so the
 * documented workaround is emitting `routeChangeError` and throwing out of the event handler.
 */
const ABORT_ROUTE_CHANGE = "Abort route change - unsaved changes guard. Safe to ignore.";

type PendingLeave = { kind: "route"; url: string } | { kind: "action"; run: () => void };

const isReloadShortcut = (event: KeyboardEvent): boolean => {
  if (event.key === "F5") {
    return true;
  }

  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "r";
};

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
  /**
   * Hold a leave that is not a Next.js route — switching language in local state, a reload
   * the keyboard handler already wired, and so on.
   */
  requestLeave: (run: () => void) => void;
}

/**
 * Holds back leaving while a form has unsaved changes, so the app can render a confirmation
 * (`ExitFormDialog` from `@saleor/apps-ui-next`) instead of losing the edits.
 *
 * Covers Pages Router transitions: back link, Cancel, language/email switches, browser Back inside
 * the app.
 *
 * Reload shortcuts (⌘R / Ctrl+R / F5) are caught too, because the Dashboard iframe is sandboxed
 * without `allow-modals` and a native `beforeunload` prompt therefore never appears. Treat that as
 * best effort: the keys only arrive while the iframe has focus, and a browser is free to reload on
 * its own shortcut regardless of `preventDefault`. A form that must not lose work needs to persist
 * its draft as well — this hook is the prompt, not the guarantee.
 *
 * Navigating Dashboard itself away from the app unmounts the iframe and is not observable here.
 */
export const useUnsavedChangesGuard = ({
  enabled,
  reload = () => window.location.reload(),
  ignoreUrl,
}: {
  enabled: boolean;
  /** Injected in tests. Defaults to a full frame reload. */
  reload?: () => void;
  /**
   * Same-page query updates that are not leaving the form (for example a `?scope=` switch).
   * Return true to let the URL through without prompting.
   */
  ignoreUrl?: (url: string) => boolean;
}): UnsavedChangesGuard => {
  const router = useRouter();
  const [pending, setPending] = useState<PendingLeave | null>(null);

  const enabledRef = useRef(enabled);
  const bypassRef = useRef(false);
  const pendingRef = useRef<PendingLeave | null>(null);
  const reloadRef = useRef(reload);
  const ignoreUrlRef = useRef(ignoreUrl);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);

  useEffect(() => {
    ignoreUrlRef.current = ignoreUrl;
  }, [ignoreUrl]);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const requestAction = useCallback((run: () => void) => {
    if (pendingRef.current) {
      return;
    }

    if (!enabledRef.current) {
      run();

      return;
    }

    setPending({ kind: "action", run });
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (
        bypassRef.current ||
        !enabledRef.current ||
        url === router.asPath ||
        ignoreUrlRef.current?.(url)
      ) {
        return;
      }

      setPending({ kind: "route", url });

      router.events.emit("routeChangeError", ABORT_ROUTE_CHANGE, url, { shallow: false });

      throw ABORT_ROUTE_CHANGE;
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current || pendingRef.current || !isReloadShortcut(event)) {
        return;
      }

      event.preventDefault();
      requestAction(() => reloadRef.current());
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [requestAction]);

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
    isBlocked: pending !== null,
    leave: useCallback(() => {
      if (!pending) {
        return;
      }

      const next = pending;

      setPending(null);

      if (next.kind === "route") {
        navigateWithoutGuard(next.url);
      } else {
        next.run();
      }
    }, [pending, navigateWithoutGuard]),
    keepEditing: useCallback(() => setPending(null), []),
    navigateWithoutGuard,
    requestLeave: requestAction,
  };
};
