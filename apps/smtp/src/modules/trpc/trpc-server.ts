import { Permission } from "@saleor/app-sdk/types";
import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

import { BaseError } from "../../errors";
import { ErrorContext } from "../smtp/services/email-compiler";
import { hasErrorCode } from "../smtp/services/template-error-codes";
import { TrpcContext } from "./trpc-context";

interface Meta {
  requiredClientPermissions?: Permission[];
  updateWebhooks?: boolean;
}

// Type guard for errors with errorContext property
function hasErrorContext(error: unknown): error is { errorContext?: ErrorContext } {
  return error !== null && typeof error === "object" && "errorContext" in error;
}

function hasPublicMessage(error: unknown): error is { publicMessage?: string } {
  return error !== null && typeof error === "object" && "publicMessage" in error;
}

const t = initTRPC
  .context<TrpcContext>()
  .meta<Meta>()
  .create({
    errorFormatter({ shape, error }) {
      const baseError = error.cause instanceof BaseError ? error.cause : undefined;
      // Extract errorContext from BaseError instances using type guard
      const errorContext =
        baseError && hasErrorContext(baseError) ? baseError.errorContext : undefined;
      const publicMessage =
        baseError && hasPublicMessage(baseError) ? baseError.publicMessage : undefined;
      const errorCode = baseError && hasErrorCode(baseError) ? baseError.errorCode : undefined;

      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.code === "BAD_REQUEST" && error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
          errorContext,
          publicMessage,
          errorCode,
        },
      };
    },
  });

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
