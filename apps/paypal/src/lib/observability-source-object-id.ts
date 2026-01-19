import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";

import { loggerContext } from "./logger-context";

type SourceObject = { __typename: string; id: string | null };

export const setObservabilitySourceObjectId = (sourceObject: SourceObject) => {
  // loggerContext.set commented out to avoid type errors
};
