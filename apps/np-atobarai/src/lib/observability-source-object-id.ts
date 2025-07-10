import { trace } from "@opentelemetry/api";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { setTag } from "@sentry/nextjs";

import { loggerContext } from "@/lib/logger-context";

// TODO: extract to a common package
export const setObservabilitySourceObjectId = (so: {
  __typename: "Checkout" | "Order";
  id: string | null;
}) => {
  if (!so.id) {
    return;
  }

  loggerContext.set(ObservabilityAttributes.SOURCE_OBJECT_ID, so.id);
  loggerContext.set(ObservabilityAttributes.SOURCE_OBJECT_TYPE, so.__typename);
  trace.getActiveSpan()?.setAttribute(ObservabilityAttributes.SOURCE_OBJECT_ID, so.id);
  trace.getActiveSpan()?.setAttribute(ObservabilityAttributes.SOURCE_OBJECT_TYPE, so.__typename);
  setTag(ObservabilityAttributes.SOURCE_OBJECT_ID, so.id);
  setTag(ObservabilityAttributes.SOURCE_OBJECT_TYPE, so.__typename);
};
