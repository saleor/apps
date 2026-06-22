import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type OnboardingState, type OnboardingStep } from "./types";
import { useExpandedOnboardingId } from "./use-expanded-onboarding-id";

describe("useExpandedOnboardingId", () => {
  it("should return first expanded step on init if exists", () => {
    const onboardingState = {
      stepsCompleted: ["get-started"],
      stepsExpanded: { "create-product": true },
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: true, expanded: undefined },
      { id: "create-product", completed: false, expanded: true },
      { id: "explore-orders", completed: false, expanded: undefined },
      { id: "graphql-playground", completed: false, expanded: undefined },
      { id: "view-extensions", completed: false, expanded: undefined },
      { id: "invite-staff", completed: false, expanded: undefined },
    ];

    const { result } = renderHook(() =>
      useExpandedOnboardingId(onboardingState, true, visibleSteps),
    );

    expect(result.current).toBe("create-product");
  });

  it("should return first not completed step when no one with expanded state", () => {
    const onboardingState = {
      stepsCompleted: ["get-started", "create-product"],
      stepsExpanded: { "get-started": false },
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: true, expanded: false },
      { id: "create-product", completed: true, expanded: undefined },
      { id: "explore-orders", completed: false, expanded: undefined },
      { id: "graphql-playground", completed: false, expanded: undefined },
      { id: "view-extensions", completed: false, expanded: undefined },
      { id: "invite-staff", completed: false, expanded: undefined },
    ];

    const { result } = renderHook(() =>
      useExpandedOnboardingId(onboardingState, true, visibleSteps),
    );

    expect(result.current).toBe("explore-orders");
  });

  it("should return empty string when all steps are collapsed", () => {
    const onboardingState = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: {
        "get-started": false,
        "create-product": false,
        "explore-orders": false,
        "graphql-playground": false,
        "view-extensions": false,
        "invite-staff": false,
      },
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: false, expanded: false },
      { id: "create-product", completed: false, expanded: false },
      { id: "explore-orders", completed: false, expanded: false },
      { id: "graphql-playground", completed: false, expanded: false },
      { id: "view-extensions", completed: false, expanded: false },
      { id: "invite-staff", completed: false, expanded: false },
    ];

    const { result } = renderHook(() =>
      useExpandedOnboardingId(onboardingState, true, visibleSteps),
    );

    expect(result.current).toBe("");
  });

  it("should return first not completed step after step completed", () => {
    const onboardingState = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: { "get-started": false },
    } as unknown as OnboardingState;
    const onboardingStateChanged = {
      onboardingExpanded: true,
      stepsCompleted: ["create-product"],
      stepsExpanded: { "get-started": false },
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: false, expanded: false },
      { id: "create-product", completed: false, expanded: undefined },
      { id: "explore-orders", completed: false, expanded: undefined },
      { id: "graphql-playground", completed: false, expanded: undefined },
      { id: "view-extensions", completed: false, expanded: undefined },
      { id: "invite-staff", completed: false, expanded: undefined },
    ];

    const { rerender, result } = renderHook(
      ({ state }) => useExpandedOnboardingId(state, true, visibleSteps),
      { initialProps: { state: onboardingState } },
    );

    rerender({ state: onboardingStateChanged });

    expect(result.current).toBe("explore-orders");
  });

  it("should return first expanded step after expand step toggle", () => {
    const onboardingState = {
      onboardingExpanded: true,
      stepsCompleted: ["get-started", "create-product"],
      stepsExpanded: { "get-started": false },
    } as unknown as OnboardingState;
    const onboardingStateChanged = {
      onboardingExpanded: true,
      stepsCompleted: ["get-started", "create-product"],
      stepsExpanded: { "get-started": false, "explore-orders": true },
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: true, expanded: false },
      { id: "create-product", completed: true, expanded: undefined },
      { id: "explore-orders", completed: false, expanded: undefined },
      { id: "graphql-playground", completed: false, expanded: undefined },
      { id: "view-extensions", completed: false, expanded: undefined },
      { id: "invite-staff", completed: false, expanded: undefined },
    ];

    const { rerender, result } = renderHook(
      ({ state }) => useExpandedOnboardingId(state, true, visibleSteps),
      { initialProps: { state: onboardingState } },
    );

    rerender({ state: onboardingStateChanged });

    expect(result.current).toBe("explore-orders");
  });
});
