import { type NextAppRouterHandler } from "@saleor/app-sdk/handlers/next-app-router";
import {
  SALEOR_API_URL_HEADER,
  SALEOR_EVENT_HEADER,
  SALEOR_SCHEMA_VERSION_HEADER,
} from "@saleor/app-sdk/headers";
import { type SaleorSchemaVersion } from "@saleor/app-sdk/types";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { BaseError } from "@saleor/errors";
import { AsyncLocalStorage } from "async_hooks";
import { type NextApiHandler, type NextApiRequest, type NextApiResponse } from "next";
import { type NextRequest } from "next/server";

export class LoggerContext {
  private als = new AsyncLocalStorage<Record<string, unknown>>();
  private project_name = process.env.OTEL_SERVICE_NAME as string | undefined;
  static GetValueFromContextError = BaseError.subclass("GetTenantDomainError");

  getRawContext() {
    const store = this.als.getStore();

    if (!store) {
      if (!process.env.CI && process.env.OTEL_ENABLED === "true") {
        console.warn(
          "You cant use LoggerContext outside of the wrapped scope. Will fallback to {}",
        );
      }

      return {};
    }

    return store;
  }

  getTenantDomain() {
    const context = this.getRawContext();

    if (context) {
      return context[ObservabilityAttributes.TENANT_DOMAIN] as string;
    }

    throw new LoggerContext.GetValueFromContextError("Tenant domain not found in logger context");
  }

  getSaleorApiUrl() {
    const context = this.getRawContext();

    if (context) {
      return context[ObservabilityAttributes.SALEOR_API_URL] as string;
    }

    throw new LoggerContext.GetValueFromContextError("Saleor API url not found in logger context");
  }

  async wrapNextApiHandler(fn: (...args: unknown[]) => unknown, initialState = {}) {
    return this.als.run(
      {
        ...initialState,
        project_name: this.project_name,
      },
      fn,
    );
  }

  async wrapNextAppRouterHandler(
    fn: (...args: unknown[]) => Response | Promise<Response>,
    initialState = {},
  ) {
    return this.als.run(
      {
        ...initialState,
        project_name: this.project_name,
      },
      fn,
    );
  }

  set(key: string, value: string | number | Record<string, unknown> | null) {
    const store = this.getRawContext();

    store[key] = value;
  }

  /**
   * Accepts raw version ("3.21.5" from payload or `shop.version`, "3.21" from header)
   * or parsed `ctx.schemaVersion` from app-sdk webhook context
   */
  setSaleorVersion(version: string | SaleorSchemaVersion | null | undefined) {
    if (!version) {
      return;
    }

    this.set(
      ObservabilityAttributes.SALEOR_VERSION,
      Array.isArray(version) ? version.join(".") : version,
    );
  }
}

export const wrapWithLoggerContext = (handler: NextApiHandler, loggerContext: LoggerContext) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return loggerContext.wrapNextApiHandler(() => {
      const saleorApiUrl = req.headers[SALEOR_API_URL_HEADER] as string;
      const saleorEvent = req.headers[SALEOR_EVENT_HEADER] as string;
      const saleorSchemaVersion = req.headers[SALEOR_SCHEMA_VERSION_HEADER] as string | undefined;
      const path = req.url as string;

      loggerContext.set(ObservabilityAttributes.PATH, path);

      if (saleorApiUrl) {
        loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);
        loggerContext.set(ObservabilityAttributes.TENANT_DOMAIN, new URL(saleorApiUrl).hostname);
      }

      if (saleorEvent) {
        loggerContext.set("saleorEvent", saleorEvent);
      }

      loggerContext.setSaleorVersion(saleorSchemaVersion);

      return handler(req, res);
    });
  };
};

export const wrapWithLoggerContextAppRouter = (
  handler: NextAppRouterHandler,
  loggerContext: LoggerContext,
) => {
  return (req: NextRequest) => {
    return loggerContext.wrapNextAppRouterHandler(() => {
      const saleorApiUrl = req.headers.get(SALEOR_API_URL_HEADER);
      const saleorEvent = req.headers.get(SALEOR_EVENT_HEADER);
      const saleorSchemaVersion = req.headers.get(SALEOR_SCHEMA_VERSION_HEADER);

      loggerContext.set(ObservabilityAttributes.PATH, req.nextUrl.pathname);

      if (saleorApiUrl) {
        loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);
        loggerContext.set(ObservabilityAttributes.TENANT_DOMAIN, new URL(saleorApiUrl).hostname);
      }

      if (saleorEvent) {
        loggerContext.set("saleorEvent", saleorEvent);
      }

      loggerContext.setSaleorVersion(saleorSchemaVersion);

      return handler(req);
    });
  };
};
