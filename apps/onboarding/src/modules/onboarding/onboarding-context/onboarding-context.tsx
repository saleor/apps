"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { getIframeSaleorApiUrl, readHomeSnapshot } from "../readiness/home-snapshot";
import { getInitialOnboardingState, normalizeOnboardingState } from "./initial-onboarding-state";
import {
  type OnboardingContextType,
  type OnboardingProviderProps,
  type OnboardingState,
} from "./types";
import { useOnboardingStorage, useUserData } from "./use-onboarding-storage";
import { withBuilderExpanded } from "./utils";

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const readSnapshotPrefs = () => readHomeSnapshot(getIframeSaleorApiUrl())?.prefs;

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(
    () => readSnapshotPrefs() ?? getInitialOnboardingState(),
  );
  const [hydrated, setHydrated] = useState(() => Boolean(readSnapshotPrefs()));
  const { user, isUserLoading } = useUserData();
  const storageService = useOnboardingStorage(user);
  const skipNextSave = useRef(true);
  const appliedMetadata = useRef(false);

  useEffect(() => {
    if (isUserLoading || appliedMetadata.current) return;

    appliedMetadata.current = true;
    const stateFromMetadata = storageService.getOnboardingState();

    if (stateFromMetadata) {
      skipNextSave.current = true;
      setOnboardingState(normalizeOnboardingState(stateFromMetadata));
    } else if (!hydrated) {
      setOnboardingState(getInitialOnboardingState());
    }

    setHydrated(true);
  }, [hydrated, isUserLoading, storageService]);

  useEffect(() => {
    if (!hydrated) return;

    if (skipNextSave.current) {
      skipNextSave.current = false;

      return;
    }

    storageService.saveOnboardingState(onboardingState);
  }, [hydrated, onboardingState, storageService]);

  const setBuilderExpanded = useCallback((expanded: boolean) => {
    setOnboardingState((prev) => withBuilderExpanded(prev, expanded));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        loading: !hydrated,
        onboardingState,
        setBuilderExpanded,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);

  if (context === null) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }

  return context;
};
