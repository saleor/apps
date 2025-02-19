import { trace } from "@opentelemetry/api";
import { SALEOR_API_URL_HEADER, SALEOR_SCHEMA_VERSION } from "@saleor/app-sdk/const";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export const wrapWithSpanAttrs = (handler: NextApiHandler) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const span = trace.getActiveSpan();

    if (span) {
      const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER] as string | undefined;
      const saleorVersion = req.headers[SALEOR_SCHEMA_VERSION] as string | undefined;

      if (saleorApiUrl) {
        span.setAttribute("saleorApiUrl", saleorApiUrl);
      }

      if (saleorVersion) {
        span.setAttribute("saleorVersion", saleorVersion);
      }
    }
    return handler(req, res);
  };
};
