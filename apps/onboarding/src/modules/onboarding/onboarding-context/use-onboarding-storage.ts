import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "urql";

import { MeDocument, UpdateUserMetadataDocument } from "@/generated/graphql";

import { type OnboardingState, type StorageService } from "./types";
import { METADATA_KEY, type MetadataInput } from "./utils";

export type OnboardingUser = {
  id: string;
  metadata: ReadonlyArray<MetadataInput>;
};

export const useUserData = (): { user: OnboardingUser | null; isUserLoading: boolean } => {
  const { appBridgeState } = useAppBridge();

  /*
   * AppBridge provides the staff token asynchronously after mount. Pause Me until it arrives,
   * otherwise the first request runs unauthenticated, resolves with no data, and the provider
   * marks itself loaded with default state — ignoring (and later overwriting) saved progress.
   */
  const hasToken = Boolean(appBridgeState?.token);
  const [{ data, fetching }] = useQuery({ query: MeDocument, pause: !hasToken });

  // Memoize so the user reference is stable across renders when the underlying data hasn't changed.
  const user = useMemo<OnboardingUser | null>(() => {
    if (!data?.me) return null;

    return {
      id: data.me.id,
      metadata: data.me.metadata,
    };
  }, [data?.me]);

  // Report loading until the token is available so the provider waits for the authenticated user.
  return { user, isUserLoading: !hasToken || fetching };
};

export const useOnboardingStorage = (user: OnboardingUser | null): StorageService => {
  const [, saveMetadata] = useMutation(UpdateUserMetadataDocument);

  /*
   * Keep the latest user/saveMetadata accessible from a single, stable debounced fn
   * so re-renders don't spawn parallel timers.
   */
  const userRef = useRef(user);
  const saveMetadataRef = useRef(saveMetadata);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    userRef.current = user;
    saveMetadataRef.current = saveMetadata;
  });

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const getOnboardingState: StorageService["getOnboardingState"] = useCallback(() => {
    try {
      const metadata = userRef.current?.metadata.find((m) => m.key === METADATA_KEY);

      if (!metadata) return undefined;

      return JSON.parse(metadata.value) as OnboardingState;
    } catch {
      return undefined;
    }
  }, []);

  const saveOnboardingState: StorageService["saveOnboardingState"] = useCallback(
    (onboardingState: OnboardingState) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        const currentUser = userRef.current;

        if (!currentUser) return;

        /*
         * Send only the onboarding key. updateMetadata applies partial key updates, so sending
         * the whole metadata array would overwrite unrelated keys with values that were stale as
         * of the last Me fetch if another dashboard/app path changed them in the meantime.
         */
        const onboardingMetadata: MetadataInput[] = [
          { key: METADATA_KEY, value: JSON.stringify(onboardingState) },
        ];

        /*
         * Self-metadata writes can fail for staff without MANAGE_STAFF; widget keeps working
         * in-memory but state will not persist for those users. urql resolves (does not reject)
         * on network/GraphQL errors and on mutation payload errors, so check the result too.
         * Failures are intentionally swallowed — the widget continues without persistence.
         */
        saveMetadataRef
          .current({ id: currentUser.id, input: onboardingMetadata })
          .then((result) => {
            if (result.error || result.data?.updateMetadata?.errors?.length) {
              // persistence failed — nothing actionable for the user, keep working in-memory
            }
          })
          .catch(() => {
            // network/unexpected rejection — same graceful degradation
          });
      }, 1000);
    },
    [],
  );

  return useMemo(
    () => ({ getOnboardingState, saveOnboardingState }),
    [getOnboardingState, saveOnboardingState],
  );
};
