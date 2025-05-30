import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { setTag } from "@sentry/nextjs";

import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import { loggerContext } from "./logger-context";

export const setObservabilitySaleorApiUrl = (
  saleorApiUrl: SaleorApiUrl,
  version?: string | null | undefined,
) => {
  loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);
  setTag(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);

  if (version) {
    loggerContext.set(ObservabilityAttributes.SALEOR_VERSION, version);
    setTag(ObservabilityAttributes.SALEOR_VERSION, version);
  }
};
