import { Permission } from "@saleor/app-sdk/types";
import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

import { BaseError } from "../../errors";
import { ErrorContext } from "../smtp/services/email-compiler";
import { TrpcContext } from "./trpc-context";

interface Meta {
  requiredClientPermissions?: Permission[];
  updateWebhooks?: boolean;
}

// Type guard for errors with errorContext property
function hasErrorContext(error: unknown): error is { errorContext?: ErrorContext } {
  return error !== null && typeof error === "object" && "errorContext" in error;
}

const t = initTRPC
  .context<TrpcContext>()
  .meta<Meta>()
  .create({
    errorFormatter({ shape, error }) {
      // Extract errorContext from BaseError instances using type guard
      const errorContext =
        error.cause instanceof BaseError && hasErrorContext(error.cause)
          ? error.cause.errorContext
          : undefined;

      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.code === "BAD_REQUEST" && error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
          errorContext,
        },
      };
    },
  });

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
