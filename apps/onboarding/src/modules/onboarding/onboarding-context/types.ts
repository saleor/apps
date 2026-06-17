import type * as React from "react";

export type OnboardingStepsIDs =
  | "get-started"
  | "create-product"
  | "explore-orders"
  | "graphql-playground"
  | "view-extensions"
  | "invite-staff";

export type OnboardingStep = {
  id: OnboardingStepsIDs;
  completed: boolean;
  expanded: boolean | undefined;
};

export type OnboardingState = {
  stepsCompleted: OnboardingStepsIDs[];
  stepsExpanded: Partial<Record<OnboardingStepsIDs, boolean>>;
  onboardingExpanded: boolean;
};

export interface StorageService {
  getOnboardingState(): OnboardingState | undefined;
  saveOnboardingState(onboardingState: OnboardingState): void;
}

export interface OnboardingContextType {
  isOnboardingCompleted: boolean;
  loading: boolean;
  extendedStepId: OnboardingStepsIDs | "";
  onboardingState: OnboardingState;
  markOnboardingStepAsCompleted: (id: OnboardingStepsIDs) => void;
  markAllAsCompleted: () => void;
  toggleExpandedOnboardingStep: (id: string, currentExpandedId: OnboardingStepsIDs | "") => void;
  toggleOnboarding: (value: boolean) => void;
  validCompletedStepsCount: number;
  visibleSteps: OnboardingStep[];
}

export interface OnboardingProviderProps {
  children: React.ReactNode;
}
