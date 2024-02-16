import { otelExchangeHandlers } from "@saleor/apps-otel";
import { createExchange } from "@saleor/apps-shared";

export const otelExchange = createExchange(
  otelExchangeHandlers.onOperation,
  otelExchangeHandlers.onResult,
);
