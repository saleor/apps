import { verifyJWT } from "@saleor/app-sdk/auth";
import { REQUIRED_SALEOR_PERMISSIONS } from "@saleor/apps-shared/permissions";
import { TRPCError } from "@trpc/server";

import { saleorApp } from "../../../saleor-app";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { createLogger } from "../../lib/logger";
import { createTraceEffect } from "../../lib/trace-effect";
import { DYNAMODB_SLOW_THRESHOLD_MS } from "../../lib/trace-effect-thresholds";
import { middleware, procedure } from "./trpc-server";

const logger = createLogger("protectedClientProcedure");

const traceAplGet = createTraceEffect({
  name: "APL get auth data",
  slowThresholdMs: DYNAMODB_SLOW_THRESHOLD_MS,
});

const attachAppToken = middleware(async ({ ctx, next }) => {
  logger.debug("attachAppToken middleware");

  const { saleorApiUrl } = ctx;

  if (!saleorApiUrl) {
    logger.debug("ctx.saleorApiUrl not found, throwing");

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing saleorApiUrl in request",
    });
  }

  const authData = await traceAplGet(() => saleorApp.apl.get(saleorApiUrl), { saleorApiUrl });

  if (!authData) {
    logger.warn("authData not found, throwing 401");

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing auth data",
    });
  }

  return next({
    ctx: {
      appToken: authData.token,
      saleorApiUrl: authData.saleorApiUrl,
      appId: authData.appId,
    },
  });
});

const validateClientToken = middleware(async ({ ctx, next, meta }) => {
  logger.debug(
    {
      permissions: meta?.requiredClientPermissions,
    },
    "Calling validateClientToken middleware with permissions required",
  );

  if (!ctx.token) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Missing token in request. This middleware can be used only in frontend",
    });
  }

  if (!ctx.appId) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Missing appId in request. This middleware can be used after auth is attached",
    });
  }

  if (!ctx.saleorApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Missing saleorApiUrl in request. This middleware can be used after auth is attached",
    });
  }

  if (!ctx.ssr) {
    try {
      logger.debug("trying to verify JWT token from frontend", {
        token: ctx.token ? `${ctx.token[0]}...` : undefined,
      });

      await verifyJWT({
        appId: ctx.appId,
        token: ctx.token,
        saleorApiUrl: ctx.saleorApiUrl,
        requiredPermissions: [
          ...REQUIRED_SALEOR_PERMISSIONS,
          ...(meta?.requiredClientPermissions || []),
        ],
      });
    } catch (e) {
      logger.debug("JWT verification failed, throwing");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "JWT verification failed",
      });
    }
  }

  return next({
    ctx: {
      ...ctx,
      saleorApiUrl: ctx.saleorApiUrl,
    },
  });
});

/**
 * Construct common graphQL client and attach it to the context
 *
 * Can be used only if called from the frontend (react-query),
 * otherwise jwks validation will fail (if createCaller used)
 *
 * TODO Rethink middleware composition to enable safe server-side router calls
 */
export const protectedClientProcedure = procedure
  .use(attachAppToken)
  .use(validateClientToken)
  .use(async ({ ctx, next }) => {
    const client = createInstrumentedGraphqlClient({
      saleorApiUrl: ctx.saleorApiUrl,
      token: ctx.appToken,
    });

    return next({
      ctx: {
        apiClient: client,
        appToken: ctx.appToken,
        saleorApiUrl: ctx.saleorApiUrl,
        appId: ctx.appId!,
      },
    });
  });
