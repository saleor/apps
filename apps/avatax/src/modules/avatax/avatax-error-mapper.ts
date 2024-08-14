import { TRPCError } from "@trpc/server";

import { BaseError } from "../../error";
import { AvataxInvalidAddressError, AvataxInvalidCredentialsError } from "../taxes/tax-error";

export class AvataxErrorToTrpcErrorMapper {
  mapError(error: InstanceType<typeof BaseError>) {
    switch (error.constructor) {
      case AvataxInvalidAddressError:
        return new TRPCError({
          message: "Invalid AvaTax address",
          code: "BAD_REQUEST",
          cause: error,
        });

      case AvataxInvalidCredentialsError:
        return new TRPCError({
          message: "Invalid AvaTax credentials",
          code: "UNAUTHORIZED",
          cause: error,
        });

      default: {
        return new TRPCError({
          message: "Not handled AvaTax error",
          code: "INTERNAL_SERVER_ERROR",
          cause: error,
        });
      }
    }
  }
}
