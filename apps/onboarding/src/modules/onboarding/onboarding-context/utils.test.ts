import { describe, expect, it } from "vitest";

import { getInitialOnboardingState, normalizeOnboardingState } from "./initial-onboarding-state";
import { withBuilderExpanded } from "./utils";

describe("normalizeOnboardingState", () => {
  it("returns defaults for invalid input", () => {
    expect(normalizeOnboardingState(null)).toStrictEqual(getInitialOnboardingState());
  });

  it("always shows the guide and ignores old step completion", () => {
    const state = normalizeOnboardingState({
      onboardingExpanded: false,
      stepsCompleted: ["get-started", "create-product"],
      stepsExpanded: { "create-product": true },
      expandedTaskId: "sales-channel",
    });

    expect(state.onboardingExpanded).toBe(true);
    expect(state.builderExpanded).toBe(false);
    expect(state.stepsCompleted).toStrictEqual(["get-started", "create-product"]);
    expect("expandedTaskId" in state).toBe(false);
  });

  it("keeps builderExpanded from metadata", () => {
    expect(normalizeOnboardingState({ builderExpanded: true }).builderExpanded).toBe(true);
  });
});

describe("state helpers", () => {
  it("toggles builder section", () => {
    const state = withBuilderExpanded(getInitialOnboardingState(), true);

    expect(state.builderExpanded).toBe(true);
  });
});
