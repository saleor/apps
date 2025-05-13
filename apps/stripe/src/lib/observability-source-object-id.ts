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

  const attributeName =
    so.__typename === "Checkout"
      ? ObservabilityAttributes.CHECKOUT_ID
      : ObservabilityAttributes.ORDER_ID;

  loggerContext.set(attributeName, so.id);
  trace.getActiveSpan()?.setAttribute(attributeName, so.id);
};
