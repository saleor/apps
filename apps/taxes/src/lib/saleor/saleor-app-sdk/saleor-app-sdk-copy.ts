import { APL, AuthData } from "@saleor/app-sdk/APL";
import { SyncWebhookEventType } from "@saleor/app-sdk/types";
import { ASTNode, print } from "graphql";

// ! start: borrowed from saleor-app-sdk
interface WebhookManifestConfigurationBase {
  name?: string;
  webhookPath: string;
  syncEvent: SyncWebhookEventType;
  isActive?: boolean;
  apl: APL;
}

interface WebhookManifestConfigurationWithAst extends WebhookManifestConfigurationBase {
  subscriptionQueryAst: ASTNode;
}

interface WebhookManifestConfigurationWithQuery extends WebhookManifestConfigurationBase {
  query: string;
}

export type WebhookManifestConfiguration =
  | WebhookManifestConfigurationWithAst
  | WebhookManifestConfigurationWithQuery;

export const gqlAstToString = (ast: ASTNode) =>
  print(ast) // convert AST to string
    .replaceAll(/\n*/g, "") // remove new lines
    .replaceAll(/\s{2,}/g, " ") // remove unnecessary multiple spaces
    .trim(); // remove whitespace from beginning and end

export type WebhookContext<T> = {
  baseUrl: string;
  event: string;
  payload: T;
  authData: AuthData;
};

export const toStringOrUndefined = (value: string | string[] | undefined) =>
  value ? value.toString() : undefined;

export const SALEOR_API_URL_HEADER = "saleor-api-url";

export const getBaseUrl = (headers: { [name: string]: string | string[] | undefined }): string => {
  const { host, "x-forwarded-proto": protocol = "http" } = headers;
  return `${protocol}://${host}`;
};

// ! end: borrowed from saleor-app-sdk
