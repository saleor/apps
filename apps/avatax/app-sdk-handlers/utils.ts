import { ASTNode, print } from "graphql";
import {
  SALEOR_API_URL_HEADER,
  SALEOR_AUTHORIZATION_BEARER_HEADER,
  SALEOR_DOMAIN_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SCHEMA_VERSION,
  SALEOR_SIGNATURE_HEADER,
} from "@saleor/app-sdk/const";

export const gqlAstToString = (ast: ASTNode) =>
  print(ast) // convert AST to string
    .replaceAll(/\n*/g, "") // remove new lines
    .replaceAll(/\s{2,}/g, " ") // remove unnecessary multiple spaces
    .trim(); // remove whitespace from beginning and end

export const getBaseUrl = (headers: Headers): string => {
  const xForwardedProto = headers.get("x-forwarded-proto") ?? "http";

  const xForwardedProtos = Array.isArray(xForwardedProto)
    ? xForwardedProto.join(",")
    : xForwardedProto;

  const protocols = xForwardedProtos.split(",");
  // prefer https over other protocols
  const protocol = protocols.find((el) => el === "https") || protocols[0];

  return `${protocol}://${headers.get("host")}`;
};

const toStringOrUndefined = (value: string | string[] | undefined | null) =>
  value ? value.toString() : undefined;

const toFloatOrNull = (value: string | string[] | undefined | null) =>
  value ? parseFloat(value.toString()) : null;

/**
 * Extracts Saleor-specific headers from the response.
 */
export const getSaleorHeaders = (headers: Headers) => ({
  domain: toStringOrUndefined(headers.get(SALEOR_DOMAIN_HEADER)),
  authorizationBearer: toStringOrUndefined(headers.get(SALEOR_AUTHORIZATION_BEARER_HEADER)),
  signature: toStringOrUndefined(headers.get(SALEOR_SIGNATURE_HEADER)),
  event: toStringOrUndefined(headers.get(SALEOR_EVENT_HEADER)),
  saleorApiUrl: toStringOrUndefined(headers.get(SALEOR_API_URL_HEADER)),
  schemaVersion: toFloatOrNull(headers.get(SALEOR_SCHEMA_VERSION)),
});
