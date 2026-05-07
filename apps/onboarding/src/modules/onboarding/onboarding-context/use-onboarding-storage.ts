import { useCallback, useMemo } from "react";
import { useMutation, useQuery } from "urql";

import { MeDocument, UpdateUserMetadataDocument } from "@/generated/graphql";

import { type OnboardingState, type StorageService } from "./types";
import { METADATA_KEY, type MetadataInput, prepareUserMetadata } from "./utils";

const debounce = <Args extends unknown[]>(fn: (...args: Args) => void, ms: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

export type OnboardingUser = {
  id: string;
  metadata: ReadonlyArray<MetadataInput>;
  userPermissions: ReadonlyArray<string>;
};

export const useUserData = (): { user: OnboardingUser | null; isUserLoading: boolean } => {
  const [{ data, fetching }] = useQuery({ query: MeDocument });

  if (fetching || !data?.me) {
    return { user: null, isUserLoading: fetching };
  }

  return {
    user: {
      id: data.me.id,
      metadata: data.me.metadata,
      userPermissions: (data.me.userPermissions ?? []).map((p) => p.code),
    },
    isUserLoading: false,
  };
};

export const useOnboardingStorage = (user: OnboardingUser | null): StorageService => {
  const [, saveMetadata] = useMutation(UpdateUserMetadataDocument);

  const getOnboardingState: StorageService["getOnboardingState"] = () => {
    try {
      const metadata = user?.metadata.find((m) => m.key === METADATA_KEY);

      if (!metadata) {
        return undefined;
      }

      return JSON.parse(metadata.value) as OnboardingState;
    } catch {
      return undefined;
    }
  };

  const saveOnboardingState = useCallback(
    async (onboardingState: OnboardingState) => {
      if (!user) {
        return;
      }

      /*
       * Self-metadata writes can fail for staff without MANAGE_STAFF; widget keeps working
       * in-memory but state will not persist for those users.
       */
      const userMetadata = prepareUserMetadata(user.metadata, onboardingState);

      await saveMetadata({ id: user.id, input: userMetadata }).catch(() => {
        // intentionally swallowed — widget continues to work without persistence
      });
    },
    [saveMetadata, user],
  );

  const debouncedSave = useMemo(
    () => debounce(saveOnboardingState, 1000),
    [saveOnboardingState],
  ) as StorageService["saveOnboardingState"];

  return {
    getOnboardingState,
    saveOnboardingState: debouncedSave,
  };
};
