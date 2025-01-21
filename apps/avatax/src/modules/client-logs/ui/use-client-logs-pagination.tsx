import { useState } from "react";

import { type LastEvaluatedKey } from "../logs-repository";

export const useClientLogsPagination = (): {
  currentEvaluatedKey: LastEvaluatedKey | undefined;
  goToPreviousEvaluatedKey: () => void;
  goToNextEvaluatedKey: (nextKey: LastEvaluatedKey) => void;
  isPreviousButtonDisabled: () => boolean;
  isNextButtonDisabled: (nextKey: LastEvaluatedKey) => boolean;
} => {
  const [lastEvaluatedKeys, setLastEvaluatedKeys] = useState<Array<LastEvaluatedKey>>([]);

  const goToPreviousEvaluatedKey = (): void => {
    setLastEvaluatedKeys((prev) => prev.slice(0, -1));
  };

  const goToNextEvaluatedKey = (nextKey: LastEvaluatedKey): void => {
    setLastEvaluatedKeys((prev) => [...prev, nextKey]);
  };

  const isPreviousButtonDisabled = (): boolean => {
    return lastEvaluatedKeys.length === 0;
  };

  const isNextButtonDisabled = (nextKey: LastEvaluatedKey): boolean => {
    return nextKey === undefined;
  };

  return {
    currentEvaluatedKey: lastEvaluatedKeys.at(-1),
    goToPreviousEvaluatedKey,
    goToNextEvaluatedKey,
    isPreviousButtonDisabled,
    isNextButtonDisabled,
  };
};
