"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
  getInitialOnboardingState,
  initialOnboardingSteps,
  TOTAL_STEPS_COUNT,
} from "./initial-onboarding-state";
import {
  type OnboardingContextType,
  type OnboardingProviderProps,
  type OnboardingState,
  type OnboardingStepsIDs,
} from "./types";
import { useExpandedOnboardingId } from "./use-expanded-onboarding-id";
import { useOnboardingStorage, useUserData } from "./use-onboarding-storage";
import { handleStateChangeAfterStepCompleted, handleStateChangeAfterToggle } from "./utils";

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    onboardingExpanded: true,
    stepsCompleted: [],
    stepsExpanded: {},
  });
  const loaded = useRef(false);
  const { user, isUserLoading } = useUserData();
  const storageService = useOnboardingStorage(user);

  useEffect(() => {
    if (loaded.current || isUserLoading) return;

    const stateFromMetadata = storageService.getOnboardingState();

    if (!stateFromMetadata) {
      setOnboardingState(getInitialOnboardingState());
    } else {
      setOnboardingState(stateFromMetadata);
    }

    loaded.current = true;
  }, [isUserLoading, storageService]);

  useEffect(() => {
    if (loaded.current) {
      storageService.saveOnboardingState(onboardingState);
    }
  }, [onboardingState, storageService]);

  const validCompletedStepsCount = onboardingState.stepsCompleted.length;
  const isOnboardingCompleted = validCompletedStepsCount >= TOTAL_STEPS_COUNT;

  const extendedStepId = useExpandedOnboardingId(
    onboardingState,
    loaded.current,
    initialOnboardingSteps,
  );

  const markOnboardingStepAsCompleted = (id: OnboardingStepsIDs) => {
    if (onboardingState.stepsCompleted.includes(id)) return;

    setOnboardingState((prev) => handleStateChangeAfterStepCompleted(prev, id));
  };

  const markAllAsCompleted = () => {
    setOnboardingState((prev) => ({
      ...prev,
      stepsCompleted: initialOnboardingSteps.map((step) => step.id),
      stepsExpanded: {},
    }));
  };

  /*
   * When the accordion is collapsed we get an empty string as id; we still need the previously
   * expanded id so we know which step to toggle off.
   */
  const toggleExpandedOnboardingStep = (id: string, currentExpandedId: OnboardingStepsIDs | "") => {
    const expandedId = id || currentExpandedId;

    setOnboardingState((prev) =>
      handleStateChangeAfterToggle(prev, expandedId as OnboardingStepsIDs, id),
    );
  };

  const toggleOnboarding = (value: boolean) => {
    // The persistence effect above saves on every onboardingState change.
    setOnboardingState((prev) => ({ ...prev, onboardingExpanded: value }));
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingCompleted,
        onboardingState,
        extendedStepId,
        loading: isUserLoading || !loaded.current,
        markOnboardingStepAsCompleted,
        markAllAsCompleted,
        toggleExpandedOnboardingStep,
        toggleOnboarding,
        validCompletedStepsCount,
        visibleSteps: initialOnboardingSteps,
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
