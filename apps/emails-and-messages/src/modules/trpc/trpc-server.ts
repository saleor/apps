import { initTRPC } from "@trpc/server";
import { TrpcContext } from "./trpc-context";
import { AppPermission } from "@saleor/app-sdk/types";
import { ZodError } from "zod";

interface Meta {
  requiredClientPermissions?: AppPermission[];
}

const t = initTRPC
  .context<TrpcContext>()
  .meta<Meta>()
  .create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.code === "BAD_REQUEST" && error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
        },
      };
    },
  });

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
