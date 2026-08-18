import type * as React from "react";

/**
 * Persisted UI preferences for the home Store Readiness guide.
 * Commerce step completion is derived from live GraphQL — not stored here.
 *
 * `expandedTaskId` is intentionally NOT persisted — writing it on every expand
 * caused metadata saves → Me refetch → loading flash loops.
 *
 * Legacy fields (`stepsCompleted`, `stepsExpanded`) are still accepted when
 * reading metadata so older clients don't crash; they are ignored for commerce.
 */
export type OnboardingState = {
  /**
   * @deprecated Hide/dismiss was removed — the guide is always shown.
   * Kept so older metadata still parses.
   */
  onboardingExpanded: boolean;
  /** Secondary "Building with the API?" section. */
  builderExpanded: boolean;
  /** @deprecated Kept for metadata compatibility with older onboarding widgets. */
  stepsCompleted: string[];
  /** @deprecated Kept for metadata compatibility with older onboarding widgets. */
  stepsExpanded: Record<string, boolean>;
};

export interface StorageService {
  getOnboardingState(): OnboardingState | undefined;
  saveOnboardingState(onboardingState: OnboardingState): void;
}

export interface OnboardingContextType {
  loading: boolean;
  onboardingState: OnboardingState;
  setBuilderExpanded: (expanded: boolean) => void;
}

export interface OnboardingProviderProps {
  children: React.ReactNode;
}
