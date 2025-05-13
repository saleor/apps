import { trace } from "@opentelemetry/api";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";

import { loggerContext } from "@/lib/logger-context";

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
};
