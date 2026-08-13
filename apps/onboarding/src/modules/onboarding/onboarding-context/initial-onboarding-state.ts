import { type OnboardingState } from "./types";

export const getInitialOnboardingState = (): OnboardingState => ({
  onboardingExpanded: true,
  builderExpanded: false,
  stepsCompleted: [],
  stepsExpanded: {},
});

/** Normalize legacy metadata shapes into the current Store Readiness state. */
export const normalizeOnboardingState = (raw: unknown): OnboardingState => {
  const initial = getInitialOnboardingState();

  if (!raw || typeof raw !== "object") {
    return initial;
  }

  const value = raw as Partial<OnboardingState>;

  return {
    onboardingExpanded: true,
    builderExpanded: Boolean(value.builderExpanded),
    stepsCompleted: Array.isArray(value.stepsCompleted) ? [...value.stepsCompleted] : [],
    stepsExpanded:
      value.stepsExpanded && typeof value.stepsExpanded === "object"
        ? { ...value.stepsExpanded }
        : {},
  };
};
