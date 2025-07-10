import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { setTag } from "@sentry/nextjs";

import { loggerContext } from "./logger-context";

// TODO: extract to a common package
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
