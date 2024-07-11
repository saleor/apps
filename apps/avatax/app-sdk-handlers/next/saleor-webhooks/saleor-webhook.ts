import { ASTNode } from "graphql";

import {
  processSaleorWebhook,
  SaleorWebhookError,
  WebhookContext,
  WebhookError,
} from "./process-saleor-webhook";
import { APL } from "@saleor/app-sdk/APL";
import {
  AsyncWebhookEventType,
  SyncWebhookEventType,
  WebhookManifest,
} from "@saleor/app-sdk/types";
import { gqlAstToString } from "../../utils";
import { NextRequest, NextResponse } from "next/server";

export interface WebhookConfig<Event = AsyncWebhookEventType | SyncWebhookEventType> {
  name?: string;
  webhookPath: string;
  event: Event;
  isActive?: boolean;
  apl: APL;
  onError?(error: WebhookError | Error, req: NextRequest): void;
  formatErrorResponse?(
    error: WebhookError | Error,
    req: NextRequest,
  ): Promise<{
    code: number;
    body: object | string;
  }>;
  query: string | ASTNode;
  /**
   * @deprecated will be removed in 0.35.0, use query field instead
   */
  subscriptionQueryAst?: ASTNode;
}

export const WebhookErrorCodeMap: Record<SaleorWebhookError, number> = {
  OTHER: 500,
  MISSING_HOST_HEADER: 400,
  MISSING_DOMAIN_HEADER: 400,
  MISSING_API_URL_HEADER: 400,
  MISSING_EVENT_HEADER: 400,
  MISSING_PAYLOAD_HEADER: 400,
  MISSING_SIGNATURE_HEADER: 400,
  MISSING_REQUEST_BODY: 400,
  WRONG_EVENT: 400,
  NOT_REGISTERED: 401,
  SIGNATURE_VERIFICATION_FAILED: 401,
  WRONG_METHOD: 405,
  CANT_BE_PARSED: 400,
  CONFIGURATION_ERROR: 500,
};

export type NextWebhookApiHandler<TPayload = unknown, TExtras = {}> = (
  req: NextRequest,
  ctx: WebhookContext<TPayload> & TExtras,
) => Promise<NextResponse>;

export abstract class SaleorWebhook<
  TPayload = unknown,
  TExtras extends Record<string, unknown> = {},
> {
  protected abstract eventType: "async" | "sync";

  protected extraContext?: TExtras;

  name: string;

  webhookPath: string;

  query: string | ASTNode;

  event: AsyncWebhookEventType | SyncWebhookEventType;

  isActive?: boolean;

  apl: APL;

  onError: WebhookConfig["onError"];

  formatErrorResponse: WebhookConfig["formatErrorResponse"];

  protected constructor(configuration: WebhookConfig) {
    const {
      name,
      webhookPath,
      event,
      query,
      apl,
      isActive = true,
      subscriptionQueryAst,
    } = configuration;

    this.name = name || `${event} webhook`;
    /**
     * Fallback subscriptionQueryAst to avoid breaking changes
     *
     * TODO Remove in 0.35.0
     */
    this.query = query ?? subscriptionQueryAst;
    this.webhookPath = webhookPath;
    this.event = event;
    this.isActive = isActive;
    this.apl = apl;
    this.onError = configuration.onError;
    this.formatErrorResponse = configuration.formatErrorResponse;
  }

  private getTargetUrl(baseUrl: string) {
    return new URL(this.webhookPath, baseUrl).href;
  }

  /**
   * Returns synchronous event manifest for this webhook.
   *
   * @param baseUrl Base URL used by your application
   * @returns WebhookManifest
   */
  getWebhookManifest(baseUrl: string): WebhookManifest {
    const manifestBase: Omit<WebhookManifest, "asyncEvents" | "syncEvents"> = {
      query: typeof this.query === "string" ? this.query : gqlAstToString(this.query),
      name: this.name,
      targetUrl: this.getTargetUrl(baseUrl),
      isActive: this.isActive,
    };

    switch (this.eventType) {
      case "async":
        return {
          ...manifestBase,
          asyncEvents: [this.event as AsyncWebhookEventType],
        };
      case "sync":
        return {
          ...manifestBase,
          syncEvents: [this.event as SyncWebhookEventType],
        };
      default: {
        throw new Error("Class extended incorrectly");
      }
    }
  }

  /**
   * Wraps provided function, to ensure incoming request comes from registered Saleor instance.
   * Also provides additional `context` object containing typed payload and request properties.
   */
  createHandler(handlerFn: NextWebhookApiHandler<TPayload, TExtras>) {
    return async (req: NextRequest): Promise<NextResponse> => {
      await processSaleorWebhook<TPayload>({
        req,
        apl: this.apl,
        allowedEvent: this.event,
      })
        .then(async (context) => {
          return handlerFn(req, { ...(this.extraContext ?? ({} as TExtras)), ...context });
        })
        .catch(async (e) => {
          if (e instanceof WebhookError) {
            if (this.onError) {
              this.onError(e, req);
            }

            if (this.formatErrorResponse) {
              const { code, body } = await this.formatErrorResponse(e, req);

              return NextResponse.json(body, { status: code });
            }

            return NextResponse.json(
              {
                error: {
                  type: e.errorType,
                  message: e.message,
                },
              },
              {
                status: WebhookErrorCodeMap[e.errorType] || 400,
              },
            );
          }

          if (this.onError) {
            this.onError(e, req);
          }

          if (this.formatErrorResponse) {
            const { code, body } = await this.formatErrorResponse(e, req);

            return NextResponse.json(body, { status: code });
          }

          return new NextResponse(null, { status: 500 });
        });

      return new NextResponse(null);
    };
  }
}
