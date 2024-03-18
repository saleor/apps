import { verifyJWT } from "@saleor/app-sdk/verify-jwt";
import { middleware, procedure } from "./trpc-server";
import { TRPCError } from "@trpc/server";
import { ProtectedHandlerError } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../saleor-app";
import { AppConfigMetadataManager } from "../app-configuration/app-config-metadata-manager";
import { createSettingsManager } from "../../lib/metadata-manager";
import { AppConfig } from "../app-configuration/app-config";
import { attachLogger } from "./middlewares";
import { createLogger } from "../../logger";
import { createInstrumentedGraphqlClient } from "../../lib/create-instrumented-graphql-client";
import { REQUIRED_SALEOR_PERMISSIONS } from "@saleor/apps-shared";

const attachAppToken = middleware(async ({ ctx, next }) => {
  const logger = createLogger("attachAppToken");

  if (!ctx.saleorApiUrl) {
    logger.debug("ctx.saleorApiUrl not found, throwing");

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing saleorApiUrl in request",
    });
  }

  logger.debug("Getting auth data");
  const authData = await saleorApp.apl.get(ctx.saleorApiUrl);

  if (!authData) {
    logger.debug("authData not found, throwing 401");

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing auth data",
    });
  }
  logger.debug("Auth data found, attaching it to the context");

  return next({
    ctx: {
      appToken: authData.token,
      saleorApiUrl: authData.saleorApiUrl,
      appId: authData.appId,
    },
  });
});

const validateClientToken = middleware(async ({ ctx, next, meta }) => {
  const logger = createLogger("validateClientToken");

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

  logger.debug(
    {
      permissions: meta?.requiredClientPermissions,
    },
    "Calling validateClientToken middleware with permissions required",
  );

  try {
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
    throw new ProtectedHandlerError("JWT verification failed: ", "JWT_VERIFICATION_FAILED");
  }

  logger.debug("Token verified");
  return next();
});

/**
 * Construct common graphQL client and attach it to the context
 *
 * Can be used only if called from the frontend (react-query),
 * otherwise jwks validation will fail (if createCaller used)
 */
export const protectedClientProcedure = procedure
  .use(attachLogger)
  .use(attachAppToken)
  .use(validateClientToken)
  .use(async ({ ctx, next }) => {
    const client = createInstrumentedGraphqlClient({
      token: ctx.appToken,
      saleorApiUrl: ctx.saleorApiUrl,
    });

    const metadataManager = new AppConfigMetadataManager(createSettingsManager(client));

    return next({
      ctx: {
        apiClient: client,
        appToken: ctx.appToken,
        saleorApiUrl: ctx.saleorApiUrl,
        appId: ctx.appId,
        appConfigMetadataManager: metadataManager,
        getConfig: async () => {
          const metadata = await metadataManager.get();

          return metadata ? AppConfig.parse(metadata) : new AppConfig();
        },
      },
    });
  });
