import { NextApiRequest } from "next";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { SALEOR_API_URL_HEADER } from "@saleor/app-sdk/const";

const pruneEmptyKeys = (obj: Record<string, unknown>): Record<string, string> => {
  const clonedObj = { ...obj };

  Object.keys(clonedObj).forEach((key) => {
    const value = obj[key];

    if (value === undefined || value === null || value === "") {
      obj[key] === undefined && delete obj[key];
    }
  });

  return clonedObj as Record<string, string>;
};

export const getAttributesFromRequest = (request: NextApiRequest) => {
  const attributes = {
    [SemanticAttributes.FAAS_EXECUTION]: request.headers["x-vercel-proxy-signature-ts"] as string,
    [SemanticAttributes.HTTP_USER_AGENT]: request.headers["user-agent"] as string,
    [SemanticAttributes.HTTP_TARGET]: request.headers.referer as string,
    [SemanticAttributes.NET_HOST_NAME]: request.headers.host as string,
    [SemanticAttributes.HTTP_METHOD]: (request.method ?? "").toUpperCase(),
    saleorApiUrl: request.headers[SALEOR_API_URL_HEADER] as string,
    "url.path": request.url,
    vercelRequestId: request.headers["x-vercel-id"],
    requestId: request.headers["x-vercel-proxy-signature-ts"] as string,
  } as const ;

  return pruneEmptyKeys(attributes);
};
