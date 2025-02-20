import { trace } from "@opentelemetry/api";
import { SALEOR_API_URL_HEADER, SALEOR_SCHEMA_VERSION } from "@saleor/app-sdk/const";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { ObservabilityAttributes } from "./observability-attributes";

export const wrapWithSpanAttributes = (handler: NextApiHandler) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const span = trace.getActiveSpan();

    if (span) {
      const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER] as string | undefined;
      const saleorVersion = req.headers[SALEOR_SCHEMA_VERSION] as string | undefined;

      if (saleorApiUrl) {
        span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);
      }

      if (saleorVersion) {
        span.setAttribute(ObservabilityAttributes.SALEOR_VERSION, saleorVersion);
      }
    }
    return handler(req, res);
  };
};
