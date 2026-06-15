import { describe, expect, it } from "vitest";

import { type OnboardingState, type OnboardingStep, type OnboardingStepsIDs } from "./types";
import {
  getFirstExpandedStepId,
  getFirstNotCompletedAndNotExpandedStep,
  getNextStepToExpand,
  handleStateChangeAfterStepCompleted,
  handleStateChangeAfterToggle,
  METADATA_KEY,
  type MetadataInput,
  prepareUserMetadata,
} from "./utils";

describe("handleStateChangeAfterStepCompleted", () => {
  it("should add the step to the completed steps", () => {
    const state = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: {},
    } as unknown as OnboardingState;

    const newState = handleStateChangeAfterStepCompleted(state, "get-started");

    expect(newState.stepsCompleted).toStrictEqual(["get-started"]);
  });

  it("should add the step to the completed steps and add get-started if not already there", () => {
    const state = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: {},
    } as unknown as OnboardingState;

    const newState = handleStateChangeAfterStepCompleted(state, "create-product");

    expect(newState.stepsCompleted).toStrictEqual(["get-started", "create-product"]);
  });

  it("should remove the step from stepsExpanded if it was expanded", () => {
    const state = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: { "create-product": true },
    } as unknown as OnboardingState;

    const newState = handleStateChangeAfterStepCompleted(state, "create-product");

    expect(newState.stepsCompleted).toStrictEqual(["get-started", "create-product"]);
    expect(newState.stepsExpanded["create-product"]).toBeUndefined();
  });
});

describe("handleStateChangeAfterToggle", () => {
  it("should set the expanded step id", () => {
    const state = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: {},
    } as unknown as OnboardingState;

    const newState = handleStateChangeAfterToggle(state, "get-started", "get-started");

    expect(newState.stepsExpanded).toStrictEqual({ "get-started": true });
  });

  it("should toggle expanded step", () => {
    const state = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: { "get-started": true },
    } as unknown as OnboardingState;

    const newState = handleStateChangeAfterToggle(state, "get-started", "");

    expect(newState.stepsExpanded).toStrictEqual({ "get-started": false });
  });

  it("should set the expanded step id and remove the previous one", () => {
    const state = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: { "get-started": true, "invite-staff": false },
    } as unknown as OnboardingState;

    const newState = handleStateChangeAfterToggle(state, "create-product", "create-product");

    expect(newState.stepsExpanded).toStrictEqual({ "create-product": true, "invite-staff": false });
  });

  it("should clear other expanded steps when a new step is expanded", () => {
    const state = {
      onboardingExpanded: true,
      stepsCompleted: [],
      stepsExpanded: { "get-started": true, "explore-orders": true },
    } as unknown as OnboardingState;

    const newState = handleStateChangeAfterToggle(state, "create-product", "create-product");

    expect(newState.stepsExpanded).toStrictEqual({ "create-product": true });
  });
});

describe("getFirstExpandedStepId", () => {
  it("should return the first expanded step id", () => {
    const onboardingState = {
      stepsCompleted: ["get-started"],
      stepsExpanded: { "create-product": true },
    } as OnboardingState;

    expect(getFirstExpandedStepId(onboardingState)).toBe("create-product");
  });

  it("should return empty string when no step is expanded", () => {
    const onboardingState = {
      stepsCompleted: ["get-started", "create-product"],
      stepsExpanded: { "get-started": false },
    } as OnboardingState;

    expect(getFirstExpandedStepId(onboardingState)).toBe("");
  });
});

describe("getFirstNotCompletedAndNotExpandedStep", () => {
  it("should return the first not completed and not expanded step", () => {
    const onboardingState = {
      stepsCompleted: ["get-started"],
      stepsExpanded: { "create-product": false },
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: true, expanded: undefined },
      { id: "create-product", completed: false, expanded: false },
      { id: "explore-orders", completed: false, expanded: undefined },
      { id: "graphql-playground", completed: false, expanded: undefined },
      { id: "view-extensions", completed: false, expanded: undefined },
      { id: "invite-staff", completed: false, expanded: undefined },
    ];

    expect(getFirstNotCompletedAndNotExpandedStep(onboardingState, visibleSteps)).toStrictEqual(
      "explore-orders",
    );
  });

  it("should return empty string when all steps are completed", () => {
    const onboardingState = {
      stepsCompleted: [
        "get-started",
        "create-product",
        "explore-orders",
        "graphql-playground",
        "view-extensions",
        "invite-staff",
      ],
      stepsExpanded: {},
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: true, expanded: undefined },
      { id: "create-product", completed: true, expanded: undefined },
      { id: "explore-orders", completed: true, expanded: undefined },
      { id: "graphql-playground", completed: true, expanded: undefined },
      { id: "view-extensions", completed: true, expanded: undefined },
      { id: "invite-staff", completed: true, expanded: undefined },
    ];

    expect(getFirstNotCompletedAndNotExpandedStep(onboardingState, visibleSteps)).toStrictEqual("");
  });
});

describe("getNextStepToExpand", () => {
  it("should return the first step after last completed", () => {
    const onboardingState = {
      stepsCompleted: ["create-product"],
      stepsExpanded: {},
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: true, expanded: undefined },
      { id: "create-product", completed: true, expanded: undefined },
      { id: "explore-orders", completed: false, expanded: undefined },
      { id: "graphql-playground", completed: false, expanded: undefined },
      { id: "view-extensions", completed: false, expanded: undefined },
      { id: "invite-staff", completed: false, expanded: undefined },
    ];

    expect(getNextStepToExpand(onboardingState, visibleSteps)).toStrictEqual("explore-orders");
  });

  it("should return empty string when no next step after last completed", () => {
    const onboardingState = {
      stepsCompleted: ["invite-staff"],
      stepsExpanded: {},
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: true, expanded: undefined },
      { id: "create-product", completed: true, expanded: undefined },
      { id: "explore-orders", completed: true, expanded: undefined },
      { id: "graphql-playground", completed: true, expanded: undefined },
      { id: "view-extensions", completed: true, expanded: undefined },
      { id: "invite-staff", completed: true, expanded: undefined },
    ];

    expect(getNextStepToExpand(onboardingState, visibleSteps)).toStrictEqual("");
  });

  it("should return empty string if lastCompletedStepId is not in visibleSteps", () => {
    const onboardingState = {
      stepsCompleted: ["non-existent-step" as OnboardingStepsIDs],
      stepsExpanded: {},
    } as OnboardingState;
    const visibleSteps: OnboardingStep[] = [
      { id: "get-started", completed: true, expanded: undefined },
      { id: "create-product", completed: true, expanded: undefined },
    ];

    expect(getNextStepToExpand(onboardingState, visibleSteps)).toStrictEqual("");
  });
});

describe("prepareUserMetadata", () => {
  const onboardingState: OnboardingState = {
    onboardingExpanded: true,
    stepsCompleted: ["get-started"],
    stepsExpanded: { "create-product": true } as unknown as Record<OnboardingStepsIDs, boolean>,
  };
  const onboardingStateString = JSON.stringify(onboardingState);

  it("should add onboarding metadata if metadata is undefined", () => {
    const result = prepareUserMetadata(undefined, onboardingState);

    expect(result).toStrictEqual([{ key: METADATA_KEY, value: onboardingStateString }]);
  });

  it("should add onboarding metadata if key is not present", () => {
    const metadata: MetadataInput[] = [{ key: "otherKey", value: "otherValue" }];

    const result = prepareUserMetadata(metadata, onboardingState);

    expect(result).toStrictEqual([
      { key: "otherKey", value: "otherValue" },
      { key: METADATA_KEY, value: onboardingStateString },
    ]);
  });

  it("should update onboarding metadata if key is present", () => {
    const metadata: MetadataInput[] = [
      { key: "otherKey", value: "otherValue" },
      { key: METADATA_KEY, value: "oldValue" },
    ];

    const result = prepareUserMetadata(metadata, onboardingState);

    expect(result).toStrictEqual([
      { key: "otherKey", value: "otherValue" },
      { key: METADATA_KEY, value: onboardingStateString },
    ]);
    expect(result.findIndex((m) => m.key === METADATA_KEY)).toBe(1);
  });

  it("should handle empty initial metadata array", () => {
    const result = prepareUserMetadata([], onboardingState);

    expect(result).toStrictEqual([{ key: METADATA_KEY, value: onboardingStateString }]);
  });
});
