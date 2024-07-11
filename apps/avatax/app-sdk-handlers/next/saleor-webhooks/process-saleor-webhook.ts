import { SpanKind, SpanStatusCode } from "@opentelemetry/api";

import { NextRequest } from "next/server";
import { APL, AuthData } from "@saleor/app-sdk/APL";
import { getOtelTracer } from "@saleor/apps-otel/src/otel-tracer";
import { parseSchemaVersion } from "@saleor/webhook-utils/src/parse-schema-version";
import { verifySignatureWithJwks } from "@saleor/app-sdk/verify-signature";
import { getBaseUrl, getSaleorHeaders } from "../../utils";
import { fetchRemoteJwks } from "../../fetch-remote-jwks";

export type SaleorWebhookError =
  | "OTHER"
  | "MISSING_HOST_HEADER"
  | "MISSING_DOMAIN_HEADER"
  | "MISSING_API_URL_HEADER"
  | "MISSING_EVENT_HEADER"
  | "MISSING_PAYLOAD_HEADER"
  | "MISSING_SIGNATURE_HEADER"
  | "MISSING_REQUEST_BODY"
  | "WRONG_EVENT"
  | "NOT_REGISTERED"
  | "SIGNATURE_VERIFICATION_FAILED"
  | "WRONG_METHOD"
  | "CANT_BE_PARSED"
  | "CONFIGURATION_ERROR";

export class WebhookError extends Error {
  errorType: SaleorWebhookError = "OTHER";

  constructor(message: string, errorType: SaleorWebhookError) {
    super(message);
    if (errorType) {
      this.errorType = errorType;
    }
    Object.setPrototypeOf(this, WebhookError.prototype);
  }
}

export type WebhookContext<T> = {
  baseUrl: string;
  event: string;
  payload: T;
  authData: AuthData;
  /** For Saleor < 3.15 it will be null. */
  schemaVersion: number | null;
};

interface ProcessSaleorWebhookArgs {
  req: NextRequest;
  apl: APL;
  allowedEvent: string;
}

type ProcessSaleorWebhook = <T = unknown>(
  props: ProcessSaleorWebhookArgs,
) => Promise<WebhookContext<T>>;

/**
 * Perform security checks on given request and return WebhookContext object.
 * In case of validation issues, instance of the WebhookError will be thrown.
 *
 * @returns WebhookContext
 */
export const processSaleorWebhook: ProcessSaleorWebhook = async <T>({
  req,
  apl,
  allowedEvent,
}: ProcessSaleorWebhookArgs): Promise<WebhookContext<T>> => {
  const tracer = getOtelTracer();

  return tracer.startActiveSpan(
    "processSaleorWebhook",
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        allowedEvent,
      },
    },
    async (span) => {
      try {
        if (req.method !== "POST") {
          throw new WebhookError("Wrong request method, only POST allowed", "WRONG_METHOD");
        }

        const { event, signature, saleorApiUrl } = getSaleorHeaders(req.headers);
        const baseUrl = getBaseUrl(req.headers);

        if (!baseUrl) {
          throw new WebhookError("Missing host header", "MISSING_HOST_HEADER");
        }

        if (!saleorApiUrl) {
          throw new WebhookError("Missing saleor-api-url header", "MISSING_API_URL_HEADER");
        }

        if (!event) {
          throw new WebhookError("Missing saleor-event header", "MISSING_EVENT_HEADER");
        }

        const expected = allowedEvent.toLowerCase();

        if (event !== expected) {
          throw new WebhookError(
            `Wrong incoming request event: ${event}. Expected: ${expected}`,
            "WRONG_EVENT",
          );
        }

        if (!signature) {
          throw new WebhookError("Missing saleor-signature header", "MISSING_SIGNATURE_HEADER");
        }

        const rawBody = await req.text();

        if (!rawBody) {
          throw new WebhookError("Missing request body", "MISSING_REQUEST_BODY");
        }

        let parsedBody: unknown & { version?: string | null };

        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          throw new WebhookError("Request body can't be parsed", "CANT_BE_PARSED");
        }

        let parsedSchemaVersion: number | null = null;

        try {
          parsedSchemaVersion = parseSchemaVersion(parsedBody.version);
        } catch {}

        /**
         * Verify if the app is properly installed for given Saleor API URL
         */
        const authData = await apl.get(saleorApiUrl);

        if (!authData) {
          throw new WebhookError(
            `Can't find auth data for ${saleorApiUrl}. Please register the application`,
            "NOT_REGISTERED",
          );
        }

        /**
         * Verify payload signature
         *
         * TODO: Add test for repeat verification scenario
         */
        try {
          if (!authData.jwks) {
            throw new Error("JWKS not found in AuthData");
          }

          await verifySignatureWithJwks(authData.jwks, signature, rawBody);
        } catch {
          const newJwks = await fetchRemoteJwks(authData.saleorApiUrl).catch((e) => {
            throw new WebhookError("Fetching remote JWKS failed", "SIGNATURE_VERIFICATION_FAILED");
          });

          try {
            await verifySignatureWithJwks(newJwks, signature, rawBody);

            await apl.set({ ...authData, jwks: newJwks });
          } catch {
            throw new WebhookError(
              "Request signature check failed",
              "SIGNATURE_VERIFICATION_FAILED",
            );
          }
        }

        span.setStatus({
          code: SpanStatusCode.OK,
        });

        return {
          baseUrl,
          event,
          payload: parsedBody as T,
          authData,
          schemaVersion: parsedSchemaVersion,
        };
      } catch (err) {
        const message = (err as Error)?.message ?? "Unknown error";

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message,
        });

        throw err;
      } finally {
        span.end();
      }
    },
  );
};
