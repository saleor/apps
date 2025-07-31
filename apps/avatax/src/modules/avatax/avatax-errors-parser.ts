import { captureException } from "@sentry/nextjs";
import { z } from "zod";

import { BaseError } from "../../error";
import {
  AvataxEntityNotFoundError,
  AvataxForbiddenAccessError,
  AvataxInvalidAddressError,
  AvataxInvalidCredentialsError,
  AvataxStringLengthError,
  AvataxSystemError,
  AvataxTransactionAlreadyCancelledError,
  AvataxUserInputError,
} from "../taxes/tax-error";
import { assertUnreachableWithoutThrow } from "../utils/assert-unreachable";
import { normalizeAvaTaxError } from "./avatax-error-normalizer";

// AvaTax fault codes that indicate user input errors (should return HTTP 400)
const USER_INPUT_FAULT_CODES = new Set([
  "InvalidZipForStateError",
  "InvalidAddress",
  "MissingAddress",
  "InvalidPostalCode",
  "InvalidParameterValue",
  "MissingLine",
  "InvalidAddressTextCase",
  "AddressLocationNotFound",
  "NotEnoughAddressesInfo",
  "CompanyNotFound",
  "InvalidDocumentType",
  "DocumentNotFound",
  "MissingRequiredFields",
  "InvalidParameterDataType",
  "RequiredElementMissing",
  "InvalidDateRange",
  "DuplicateEntry",
]);

export class AvataxErrorsParser {
  static UnhandledErrorShapeError = BaseError.subclass("UnhandledErrorShapeError");

  private static schema = z.object({
    // https://developer.avalara.com/avatax/errors/
    code: z.enum([
      "InvalidAddress",
      "GetTaxError",
      "AuthenticationException",
      "StringLengthError",
      "EntityNotFoundError",
      "TransactionAlreadyCancelled",
      "PermissionRequired",
    ]),
    details: z.array(
      z.object({
        faultSubCode: z.string().optional(),
        description: z.string().optional(),
        helpLink: z.string().optional(),
        message: z.string().optional(),
      }),
    ),
  });

  parse(err: unknown, injectedErrorCapture = captureException) {
    const parsedError = AvataxErrorsParser.schema.safeParse(err);

    if (!parsedError.success) {
      injectedErrorCapture(
        new AvataxErrorsParser.UnhandledErrorShapeError(
          "AvaTax returned error with unknown shape",
          {
            errors: [parsedError.error],
          },
        ),
      );

      return normalizeAvaTaxError(err);
    }

    switch (parsedError.data.code) {
      case "InvalidAddress": {
        return AvataxInvalidAddressError.normalize(parsedError);
      }

      case "GetTaxError": {
        // Parse faultSubCode from details to determine if this is a user input error or system error
        const firstDetail = parsedError.data.details[0];
        const faultSubCode = firstDetail?.faultSubCode;
        const description = firstDetail?.description || "";
        const message = firstDetail?.message || "";

        if (faultSubCode && USER_INPUT_FAULT_CODES.has(faultSubCode)) {
          // User input error - return HTTP 400
          return new AvataxUserInputError(parsedError.data.code, {
            props: {
              faultSubCode,
              description,
              message,
            },
          });
        } else {
          // System/app error - return HTTP 500
          return new AvataxSystemError(parsedError.data.code, {
            props: {
              faultSubCode: faultSubCode || "Unknown",
              description,
              message,
            },
          });
        }
      }

      case "AuthenticationException": {
        return AvataxInvalidCredentialsError.normalize(parsedError);
      }

      case "StringLengthError": {
        return new AvataxStringLengthError(parsedError.data.code, {
          props: {
            description: parsedError.data.details[0].description,
          },
        });
      }

      case "EntityNotFoundError": {
        return new AvataxEntityNotFoundError(parsedError.data.code, {
          props: {
            description: parsedError.data.details[0].description,
          },
        });
      }

      case "TransactionAlreadyCancelled": {
        return new AvataxTransactionAlreadyCancelledError(parsedError.data.code, {
          props: {
            description: parsedError.data.details[0].description,
          },
        });
      }

      case "PermissionRequired": {
        return new AvataxForbiddenAccessError(parsedError.data.code, {
          props: {
            description: parsedError.data.details[0].description,
          },
        });
      }

      default: {
        assertUnreachableWithoutThrow(parsedError.data.code);

        return normalizeAvaTaxError(err);
      }
    }
  }
}
