import { verifyJWT } from "@saleor/app-sdk/verify-jwt";
import { middleware, procedure } from "./trpc-server";
import { TRPCError } from "@trpc/server";
import { ProtectedHandlerError } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../saleor-app";
import { createClient } from "../../lib/create-graphql-client";
import { attachLogger } from "./middlewares/attach-logger";
import { createLogger } from "@saleor/apps-shared";

const attachSaleorAuthData = middleware(async ({ ctx, next }) => {
  const logger = createLogger({
    name: "attachSaleorAuthData",
    saleorApiUrl: ctx.saleorApiUrl,
  });

  if (!ctx.saleorApiUrl) {
    logger.debug("ctx.saleorApiUrl not found, throwing");

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing saleorApiUrl header in request",
    });
  }

  logger.debug("Check if APL has registration given saleorApiUrl");

  const authData = await saleorApp.apl.get(ctx.saleorApiUrl);

  if (!authData) {
    logger.debug("authData not found, throwing 401");

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing auth data",
    });
  }

  return next({
    ctx: {
      authData,
    },
  });
});

const validateClientToken = attachSaleorAuthData.unstable_pipe(
  async ({ ctx: { authData, appBridgeToken }, next, meta }) => {
    const logger = createLogger({
      name: "validateClientToken",
      requiredPermissions: meta?.requiredClientPermissions,
      saleorApiUrl: authData.saleorApiUrl,
    });

    if (!appBridgeToken) {
      logger.debug("Missing JWT token in the request.");
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Missing JWT token in the request.",
      });
    }

    logger.debug("Verify JWT token");

    try {
      await verifyJWT({
        appId: authData.appId,
        token: appBridgeToken,
        saleorApiUrl: authData.saleorApiUrl,
        requiredPermissions: meta?.requiredClientPermissions ?? [],
      });
    } catch (e) {
      logger.debug("JWT verification failed, throwing error");
      throw new ProtectedHandlerError("JWT verification failed: ", "JWT_VERIFICATION_FAILED");
    }

    return next();
  }
);

/**
 * Construct common GraphQL client and attach it to the context
 *
 * Can be used only if called from the frontend (react-query),
 * otherwise jwks validation will fail (if createCaller used)
 *
 * TODO Rethink middleware composition to enable safe server-side router calls
 */
export const protectedClientProcedure = procedure
  .use(attachLogger)
  .use(validateClientToken)
  .use(async ({ ctx: { authData }, next }) =>
    next({
      ctx: {
        apiClient: createClient(authData.saleorApiUrl, async () =>
          Promise.resolve({ token: authData.token })
        ),
      },
    })
  );
