import { useEffect, useRef, useState } from "react";

import { type OnboardingState, type OnboardingStep, type OnboardingStepsIDs } from "./types";
import {
  getFirstExpandedStepId,
  getFirstNotCompletedAndNotExpandedStep,
  getNextStepToExpand,
} from "./utils";

export const useExpandedOnboardingId = (
  onboardingState: OnboardingState,
  loaded: boolean,
  visibleSteps: OnboardingStep[],
) => {
  const hasBeenCalled = useRef(false);
  const [expandedStepId, setExpandedStepId] = useState<OnboardingStepsIDs | "">("");

  useEffect(() => {
    if (hasBeenCalled.current) {
      const firstExpandedStepId = getFirstExpandedStepId(onboardingState);

      if (firstExpandedStepId) {
        setExpandedStepId(firstExpandedStepId);
      } else {
        setExpandedStepId(getFirstNotCompletedAndNotExpandedStep(onboardingState, visibleSteps));
      }
    }
  }, [onboardingState.stepsExpanded, visibleSteps]);

  useEffect(() => {
    if (hasBeenCalled.current) {
      setExpandedStepId(getNextStepToExpand(onboardingState, visibleSteps));
    }
  }, [onboardingState.stepsCompleted, visibleSteps]);

  useEffect(() => {
    if (loaded && !hasBeenCalled.current) {
      hasBeenCalled.current = true;

      const firstExpandedStep = getFirstExpandedStepId(onboardingState);

      if (firstExpandedStep) {
        setExpandedStepId(firstExpandedStep);
      } else {
        setExpandedStepId(getFirstNotCompletedAndNotExpandedStep(onboardingState, visibleSteps));
      }
    }
  }, [loaded, onboardingState, visibleSteps]);

  return expandedStepId;
};
