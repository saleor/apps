export interface AppProblemError {
  field: string | null;
  message: string | null;
  code: string;
}

export interface AppProblemCreateMutation {
  appProblemCreate?: {
    errors: AppProblemError[];
  } | null;
}

export interface AppProblemCreateVariables {
  input: {
    message: string;
    key: string;
    aggregationPeriod?: number;
    criticalThreshold?: number;
  };
}

export interface AppProblemDismissMutation {
  appProblemDismiss?: {
    errors: AppProblemError[];
  } | null;
}

export interface AppProblemDismissVariables {
  keys: string[];
}
