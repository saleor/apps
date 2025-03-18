import { trace } from "@opentelemetry/api";
import { SALEOR_API_URL_HEADER, SALEOR_SCHEMA_VERSION_HEADER } from "@saleor/app-sdk/headers";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { ObservabilityAttributes } from "./observability-attributes";
import { WebApiHandler } from "@saleor/app-sdk/handlers/fetch-api";

export const withSpanAttributes = (handler: NextApiHandler) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const span = trace.getActiveSpan();

    if (span) {
      const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER] as string | undefined;
      const saleorVersion = req.headers[SALEOR_SCHEMA_VERSION_HEADER] as string | undefined;

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


export const withSpanAttributesAppRouter = (handler: WebApiHandler) => {
  return (req: Request) => {
    const span = trace.getActiveSpan();

    if (span) {
      const saleorApiUrl = req.headers.get(SALEOR_API_URL_HEADER);
      const saleorVersion = req.headers.get(SALEOR_SCHEMA_VERSION_HEADER);

      if (saleorApiUrl) {
        span.setAttribute(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);
      }

      if (saleorVersion) {
        span.setAttribute(ObservabilityAttributes.SALEOR_VERSION, saleorVersion);
      }
    }
    return handler(req);
  };
}
