import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "urql";

import { MeDocument, UpdateUserMetadataDocument } from "@/generated/graphql";

import { normalizeOnboardingState } from "./initial-onboarding-state";
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

  const user = useMemo<OnboardingUser | null>(() => {
    if (!data?.me) return null;

    return {
      id: data.me.id,
      metadata: data.me.metadata,
    };
  }, [data?.me]);

  /*
   * Only the initial Me fetch should block hydration. Refetch after metadata
   * writes must not flip the whole guide back to a loading skeleton.
   */
  return { user, isUserLoading: !hasToken || (fetching && !data) };
};

export const useOnboardingStorage = (user: OnboardingUser | null): StorageService => {
  const [, saveMetadata] = useMutation(UpdateUserMetadataDocument);

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

      return normalizeOnboardingState(JSON.parse(metadata.value));
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

        const onboardingMetadata: MetadataInput[] = [
          { key: METADATA_KEY, value: JSON.stringify(onboardingState) },
        ];

        saveMetadataRef
          .current({ id: currentUser.id, input: onboardingMetadata })
          .then((result) => {
            if (result.error || result.data?.updateMetadata?.errors?.length) {
              // persistence failed — keep working in-memory
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
