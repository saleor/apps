import { type OnboardingState } from "./types";

export type MetadataInput = { key: string; value: string };

/*
 * Drop-in compatible with the dashboard's built-in onboarding key — builder
 * preference stays in sync if both surfaces ever share metadata.
 */
export const METADATA_KEY = "onboarding";

export const withBuilderExpanded = (
  state: OnboardingState,
  builderExpanded: boolean,
): OnboardingState => ({
  ...state,
  builderExpanded,
});
