import { captureException } from "@sentry/nextjs";
import { z } from "zod";

import { BaseError } from "../../error";
import {
  AvataxEntityNotFoundError,
  AvataxForbiddenAccessError,
  AvataxGetTaxSystemError,
  AvataxGetTaxWrongUserInputError,
  AvataxInvalidAddressError,
  AvataxInvalidCredentialsError,
  AvataxStringLengthError,
  AvataxTransactionAlreadyCancelledError,
} from "../taxes/tax-error";
import { assertUnreachableWithoutThrow } from "../utils/assert-unreachable";
import { normalizeAvaTaxError } from "./avatax-error-normalizer";

export class AvataxErrorsParser {
  static UnhandledErrorShapeError = BaseError.subclass("UnhandledErrorShapeError");

  /**
   * User input fault codes that should return HTTP 400 - errors caused by invalid user data
   * Reference: https://developer.avalara.com/avatax/common-errors/
   */
  private static userInputFaultCodes = [
    "InvalidZipForStateError", // Zip not valid for the provided state
    "ZipNotValidError", // Zip not valid for the provided state
    "AddressRangeError", // The address number is out of range
    "InvalidAddress", // Address is incomplete or invalid
    "InsufficientAddressError", // Insufficient address information
    "PostalCodeError", // Invalid ZIP/Postal Code
    "AddressError", // Unable to validate the address
    "CountryError", // Unknown country name or code
    "DateRangeError", // Start Date cannot be later than the End Date.
    "RegionCodeError", // Invalid or missing state/province code.
  ] as const;

  private static userInputFaultCodesSet = new Set(AvataxErrorsParser.userInputFaultCodes);

  /**
   * System fault codes that should return HTTP 500 - errors caused by system/app configuration issues
   * Reference: https://developer.avalara.com/avatax/common-errors/
   */
  private static systemFaultCodes = [
    "CompanyNotFoundError", // Company not found.
    "DocStatusError", // DocStatus is invalid for this operation.
    "DocTypeError", // DocType is invalid.
    "DocumentNotFoundError", // The tax document could not be found.
    "TaxAddressError", // Address (origin or destination) is incomplete or invalid.
    "JurisdictionNotFoundError", // Unable to determine the taxing jurisdictions.
    "InactiveCompanyError", // Tax operations not allowed for an inactive company.
    "DuplicateLineNoError", // Duplicate line number.
    "TaxRegionError", // The TaxRegionId was not found.
    "TaxOverrideError", // Tax override cannot be applied.
    "UnsupportedCountryError", // Country not supported.
  ] as const;

  private static faultSubCodeSchema = z.enum([
    ...AvataxErrorsParser.userInputFaultCodes,
    ...AvataxErrorsParser.systemFaultCodes,
  ]);

  private static baseDetailsSchema = z.object({
    description: z.string().optional(),
    helpLink: z.string().optional(),
    message: z.string().optional(),
    faultCode: z.string().optional(),
  });

  private static schema = z.discriminatedUnion("code", [
    z.object({
      code: z.literal("InvalidAddress"),
      details: z.array(AvataxErrorsParser.baseDetailsSchema),
    }),
    z.object({
      code: z.literal("GetTaxError"),
      details: z.array(
        AvataxErrorsParser.baseDetailsSchema.extend({
          faultSubCode: AvataxErrorsParser.faultSubCodeSchema.optional(),
        }),
      ),
    }),
    z.object({
      code: z.literal("AuthenticationException"),
      details: z.array(AvataxErrorsParser.baseDetailsSchema),
    }),
    z.object({
      code: z.literal("StringLengthError"),
      details: z.array(AvataxErrorsParser.baseDetailsSchema),
    }),
    z.object({
      code: z.literal("EntityNotFoundError"),
      details: z.array(AvataxErrorsParser.baseDetailsSchema),
    }),
    z.object({
      code: z.literal("TransactionAlreadyCancelled"),
      details: z.array(AvataxErrorsParser.baseDetailsSchema),
    }),
    z.object({
      code: z.literal("PermissionRequired"),
      details: z.array(AvataxErrorsParser.baseDetailsSchema),
    }),
  ]);

  parse(err: unknown, injectedErrorCapture = captureException) {
    const parsedError = AvataxErrorsParser.schema.safeParse(err);

    if (!parsedError.success) {
      injectedErrorCapture(
        new AvataxErrorsParser.UnhandledErrorShapeError(
          "AvaTax returned error with unknown shape",
          {
            errors: [parsedError.error],
            cause: err,
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
        const firstDetail = parsedError.data.details[0];
        const faultSubCode = firstDetail?.faultSubCode;
        const description = firstDetail?.description;
        const message = firstDetail?.message;

        if (faultSubCode && AvataxErrorsParser.userInputFaultCodesSet.has(faultSubCode)) {
          return new AvataxGetTaxWrongUserInputError(parsedError.data.code, {
            props: {
              faultSubCode,
              description,
              message,
            },
          });
        } else {
          return new AvataxGetTaxSystemError(parsedError.data.code, {
            props: {
              faultSubCode,
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
        assertUnreachableWithoutThrow(parsedError.data);

        return normalizeAvaTaxError(err);
      }
    }
  }
}
