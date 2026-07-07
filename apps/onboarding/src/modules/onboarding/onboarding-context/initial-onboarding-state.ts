import { type OnboardingState, type OnboardingStep } from "./types";

// We store state in metadata for all steps even those that are not shown to the user.
export const initialOnboardingSteps: OnboardingStep[] = [
  { id: "get-started", completed: false, expanded: undefined },
  { id: "create-product", completed: false, expanded: undefined },
  { id: "explore-orders", completed: false, expanded: undefined },
  { id: "graphql-playground", completed: false, expanded: undefined },
  { id: "view-extensions", completed: false, expanded: undefined },
  { id: "invite-staff", completed: false, expanded: undefined },
];

// Onboarding is complete once every rendered step is done.
export const TOTAL_STEPS_COUNT = initialOnboardingSteps.length;

export const getInitialOnboardingState = (): OnboardingState => ({
  onboardingExpanded: true,
  stepsCompleted: [],
  stepsExpanded: {},
});
